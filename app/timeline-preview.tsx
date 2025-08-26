import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTimerStore } from '@/store/useTimerStore';
import { WorkoutJSON, TimerEvent } from '@/lib/types';
import { buildTimeline } from '@/lib/timeline';
import { Field, Label } from '@/components/Field';

export default function TimelinePreview() {
  const router = useRouter();
  const { workout, timeline } = useTimerStore();
  const [editingEvent, setEditingEvent] = useState<TimerEvent | null>(null);
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

  const handleEditEvent = (event: TimerEvent) => {
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

  const handleDeleteEvent = (event: TimerEvent) => {
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

  const handleAddEvent = (afterEvent: TimerEvent) => {
    // Add a new event after the selected one
    const newEvent: TimerEvent = {
      startMs: afterEvent.endMs,
      endMs: afterEvent.endMs + 30000, // 30 seconds default
      label: 'New Exercise',
      blockIndex: afterEvent.blockIndex,
      round: afterEvent.round || 1,
      cueAtMs: [afterEvent.endMs, afterEvent.endMs + 25000],
      kind: 'work'
    };

    const updatedTimeline = [...timeline];
    const insertIndex = updatedTimeline.indexOf(afterEvent) + 1;
    updatedTimeline.splice(insertIndex, 0, newEvent);
    
    // Shift all subsequent events
    for (let i = insertIndex + 1; i < updatedTimeline.length; i++) {
      const shift = 30000; // 30 seconds
      updatedTimeline[i].startMs += shift;
      updatedTimeline[i].endMs += shift;
      if (updatedTimeline[i].cueAtMs) {
        updatedTimeline[i].cueAtMs = updatedTimeline[i].cueAtMs!.map(ms => ms + shift);
      }
    }
    
    const updatedWorkout = rebuildWorkoutFromTimeline(workout, updatedTimeline);
    useTimerStore.getState().setWorkout(updatedWorkout, updatedTimeline);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (startMs: number, endMs: number) => {
    const duration = endMs - startMs;
    if (duration < 60000) {
      return `${Math.floor(duration / 1000)}s`;
    } else {
      return `${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s`;
    }
  };

  const getEventColor = (kind?: string) => {
    switch (kind) {
      case 'work': return '#34C759';
      case 'rest': return '#FF9500';
      case 'round_rest': return '#FF3B30';
      default: return '#007AFF';
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
            {workout.title}
          </Text>
          <Text style={{ fontSize: 16, color: '#666', marginBottom: 12 }}>
            {Math.ceil(workout.total_seconds / 60)} minutes • {timeline.length} events
          </Text>
          <Text style={{ fontSize: 14, color: '#999' }}>
            Swipe left on any event to edit, delete, or add new events
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
                borderRadius: 8, 
                padding: 16,
                borderLeftWidth: 4,
                borderLeftColor: getEventColor(event.kind)
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{event.label}</Text>
                    <Text style={{ fontSize: 14, color: '#666' }}>{formatTime(event.startMs)} - {formatTime(event.endMs)} • {formatDuration(event.startMs, event.endMs)}</Text>
                    {event.round && (<Text style={{ fontSize: 12, color: '#999' }}>Round {event.round}</Text>)}
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity 
                      onPress={() => handleEditEvent(event)} 
                      style={{ 
                        backgroundColor: '#007AFF', 
                        paddingHorizontal: 12, 
                        paddingVertical: 6, 
                        borderRadius: 4, 
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
                        borderRadius: 4, 
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
                        borderRadius: 4 
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
            onPress={() => router.push("/run")}
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
      <Modal visible={editModalVisible} animationType="slide" transparent={true} onRequestClose={() => setEditModalVisible(false)}>
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
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Edit Event</Text>
            
            <Field>
              <Label>Event Name</Label>
              <TextInput 
                value={editName} 
                onChangeText={setEditName} 
                style={{ 
                  borderWidth: 1, 
                  borderColor: '#ddd', 
                  borderRadius: 8, 
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
                  borderRadius: 8, 
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
                  padding: 16, 
                  borderRadius: 8,
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
                  padding: 16, 
                  borderRadius: 8,
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

function rebuildWorkoutFromTimeline(workout: WorkoutJSON, timeline: TimerEvent[]): WorkoutJSON {
  const totalSeconds = timeline[timeline.length - 1]?.endMs / 1000 || workout.total_seconds;
  return { ...workout, total_seconds: totalSeconds };
}
