import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AudioRecorderPlayer from 'react-native-nitro-sound';
import { spacing, useTheme } from '../../theme';
import { formatAudioDuration } from '../../utils/formatters';

interface AudioMessagePlayerProps {
  uri: string;
  duration: number;
  isMine: boolean;
}

export const AudioMessagePlayer: React.FC<AudioMessagePlayerProps> = ({ uri, duration, isMine }) => {
  const { colors } = useTheme();
const playerRef = useRef(AudioRecorderPlayer);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    return () => {
      playerRef.current.stopPlayer().catch(() => {});
      playerRef.current.removePlayBackListener();
    };
  }, []);

  const togglePlay = async () => {
    const player = playerRef.current;
    if (isPlaying) {
      await player.pausePlayer();
      setIsPlaying(false);
      return;
    }
    await player.startPlayer(uri);
    setIsPlaying(true);
    player.addPlayBackListener((e) => {
      setProgress(e.currentPosition / e.duration);
      setElapsed(e.currentPosition / 1000);
      if (e.currentPosition >= e.duration) {
        setIsPlaying(false);
        setProgress(0);
        setElapsed(0);
        player.stopPlayer();
      }
    });
  };

  const barColor = isMine ? colors.primaryDark : colors.primary;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={togglePlay} style={[styles.playButton, { backgroundColor: barColor }]}>
        <Icon name={isPlaying ? 'pause' : 'play'} size={16} color="#fff" />
      </TouchableOpacity>
      <View style={styles.waveTrack}>
        <View style={[styles.waveFill, { width: `${progress * 100}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[styles.duration, { color: colors.textSecondary }]}>
        {formatAudioDuration(isPlaying || elapsed > 0 ? elapsed : duration)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', width: 200, paddingVertical: 4 },
  playButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  waveTrack: { flex: 1, height: 3, backgroundColor: '#00000022', borderRadius: 2, marginHorizontal: spacing.sm },
  waveFill: { height: 3, borderRadius: 2 },
  duration: { fontSize: 11, minWidth: 32 },
});
