import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTimerStore } from '@/store/useTimerStore';
import { WorkoutJSON, TimelineEvent } from '@/lib/types';
import { buildTimeline } from '@/lib/timeline';
import { Field, Label } from '@/components/Field';

export default function TimelinePreview() {
  const router = useRouter();
  const { workout, timeline } = useTimerStore();
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSeconds, setEditSeconds] = useState('');

  if (!workout || !timeline) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No workout data found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: 'blue', marginTop: 20 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleEditEvent = (event: TimelineEvent) => {
    setEditingEvent(event);
    setEditName(event.label);
    setEditSeconds(Math.floor((event.endMs - event.startMs) / 1000).toString());
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingEvent || !editName.trim() || !editSeconds.trim()) return;
    
    const newSeconds = parseInt(editSeconds);
    if (isNaN(newSeconds) || newSeconds <= 0) {
      Alert.alert('Invalid time', 'Please enter a valid number of seconds');
      return;
    }

    // Update the timeline event
    const updatedTimeline = timeline.map(event => {
      if (event === editingEvent) {
        const duration = newSeconds * 1000;
        return {
          ...event,
          label: editName.trim(),
          endMs: event.startMs + duration
        };
      }
      return event;
    });

    // Rebuild the workout from the updated timeline
    const updatedWorkout = rebuildWorkoutFromTimeline(workout, updatedTimeline);
    
    // Update the store
    useTimerStore.getState().setWorkout(updatedWorkout, updatedTimeline);
    
    setEditModalVisible(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (event: TimelineEvent) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedTimeline = timeline.filter(e => e !== event);
            const updatedWorkout = rebuildWorkoutFromTimeline(workout, updatedTimeline);
            useTimerStore.getState().setWorkout(updatedWorkout, updatedTimeline);
          }
        }
      ]
    );
  };

  const handleAddEvent = (afterEvent: TimelineEvent) => {
    // Add a new event after the selected one
    const newEvent: TimelineEvent = {
      startMs: afterEvent.endMs,
      endMs: afterEvent.endMs + 30000, // 30 seconds default
      label: 'New Exercise',
      blockIndex: afterEvent.blockIndex,
      round: afterEvent.round,
      cueAtMs: [afterEvent.endMs, afterEvent.endMs + 25000]
    };

    const updatedTimeline = [...timeline];
    const insertIndex = updatedTimeline.indexOf(afterEvent) + 1;
    updatedTimeline.splice(insertIndex, 0, newEvent);
    
    // Adjust all subsequent event times
    for (let i = insertIndex + 1; i < updatedTimeline.length; i++) {
      const shift = newEvent.endMs - newEvent.startMs;
      updatedTimeline[i].startMs += shift;
      updatedTimeline[i].endMs += shift;
    }

    const updatedWorkout = rebuildWorkoutFromTimeline(workout, updatedTimeline);
    useTimerStore.getState().setWorkout(updatedWorkout, updatedTimeline);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (startMs: number, endMs: number) => {
    const duration = Math.floor((endMs - startMs) / 1000);
    if (duration < 60) {
      return `${duration}s`;
    }
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
            {workout.title}
          </Text>
          <Text style={{ fontSize: 16, color: '#666' }}>
            {workout.total_minutes} minutes • {workout.blocks.length} blocks
          </Text>
          {workout.debug && (
            <View style={{ 
              backgroundColor: workout.debug.used_ai ? '#e8f5e8' : '#fff3cd',
              padding: 8,
              borderRadius: 8,
              marginTop: 8
            }}>
              <Text style={{ 
                color: workout.debug.used_ai ? '#0a0' : '#856404',
                fontSize: 12
              }}>
                {workout.debug.used_ai ? '🤖 AI Generated' : '⚡ Deterministic Parse'} • 
                {workout.debug.inferred_mode || ''} 
                {workout.debug.notes ? ` • ${workout.debug.notes}` : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={{ 
          backgroundColor: '#e3f2fd', 
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 20 
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            📋 Workout Preview
          </Text>
          <Text style={{ fontSize: 14, color: '#1976d2' }}>
            Review your workout timeline below. Swipe left on any event to edit, delete, or add new events.
          </Text>
        </View>

        {/* Timeline */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Timeline ({timeline.length} events)
          </Text>
          
          {timeline.map((event, index) => (
            <View key={index} style={{ marginBottom: 12 }}>
              <View style={{ 
                backgroundColor: 'white', 
                padding: 16, 
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                      {event.label}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#666' }}>
                      {formatTime(event.startMs)} - {formatTime(event.endMs)} • {formatDuration(event.startMs, event.endMs)}
                    </Text>
                    {event.round && (
                      <Text style={{ fontSize: 12, color: '#999' }}>
                        Round {event.round}
                      </Text>
                    )}
                  </View>
                  
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      onPress={() => handleEditEvent(event)}
                      style={{ 
                        backgroundColor: '#007AFF', 
                        paddingHorizontal: 12, 
                        paddingVertical: 6, 
                        borderRadius: 6,
                        marginRight: 8
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 12 }}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleDeleteEvent(event)}
                      style={{ 
                        backgroundColor: '#FF3B30', 
                        paddingHorizontal: 12, 
                        paddingVertical: 6, 
                        borderRadius: 6,
                        marginRight: 8
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 12 }}>Delete</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleAddEvent(event)}
                      style={{ 
                        backgroundColor: '#34C759', 
                        paddingHorizontal: 12, 
                        paddingVertical: 6, 
                        borderRadius: 6
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 12 }}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ 
              flex: 1, 
              backgroundColor: '#666', 
              padding: 16, 
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Back to Edit
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.push('/run')}
            style={{ 
              flex: 1, 
              backgroundColor: '#34C759', 
              padding: 16, 
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Start Timer
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <View style={{ 
            backgroundColor: 'white', 
            padding: 20, 
            borderRadius: 12, 
            width: '80%',
            maxWidth: 400
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
              Edit Event
            </Text>
            
            <Field>
              <Label>Event Name</Label>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={{ 
                  borderWidth: 1, 
                  borderColor: '#ddd', 
                  borderRadius: 6, 
                  padding: 12,
                  fontSize: 16
                }}
                placeholder="Enter event name"
              />
            </Field>
            
            <Field>
              <Label>Duration (seconds)</Label>
              <TextInput
                value={editSeconds}
                onChangeText={setEditSeconds}
                style={{ 
                  borderWidth: 1, 
                  borderColor: '#ddd', 
                  borderRadius: 6, 
                  padding: 12,
                  fontSize: 16
                }}
                placeholder="Enter duration in seconds"
                keyboardType="numeric"
              />
            </Field>
            
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={{ 
                  flex: 1, 
                  backgroundColor: '#666', 
                  padding: 12, 
                  borderRadius: 6,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: 'white' }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSaveEdit}
                style={{ 
                  flex: 1, 
                  backgroundColor: '#007AFF', 
                  padding: 12, 
                  borderRadius: 6,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: 'white' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Helper function to rebuild workout from timeline
function rebuildWorkoutFromTimeline(workout: WorkoutJSON, timeline: TimelineEvent[]): WorkoutJSON {
  // This is a simplified version - in a real app you'd want more sophisticated logic
  // to properly reconstruct the workout structure from timeline changes
  
  const totalMinutes = Math.ceil(timeline[timeline.length - 1]?.endMs / 60000) || workout.total_minutes;
  
  return {
    ...workout,
    total_minutes: totalMinutes
  };
}
