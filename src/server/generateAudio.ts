import fs from 'fs';
import path from 'path';

// Generate a valid 16-bit PCM WAV file with rich sacred organ / choir harmonics
export function generateSacredHymnWav(chords: number[][], durationSec = 30): Buffer {
  const sampleRate = 22050; // 22.05 kHz for compact size and clean sound
  const numChannels = 1;
  const bytesPerSample = 2;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const dataSize = totalSamples * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Chunk
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // Format Chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // Data Chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  const chordCount = chords.length;
  const chordDuration = durationSec / chordCount;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.min(Math.floor(t / chordDuration), chordCount - 1);
    const chordT = t % chordDuration;
    const currentChord = chords[chordIndex];

    // Smooth envelope: gentle attack, sustain, soft release
    let env = 1.0;
    if (chordT < 0.25) {
      env = chordT / 0.25;
    } else if (chordT > chordDuration - 0.25) {
      env = Math.max(0, (chordDuration - chordT) / 0.25);
    }

    let sampleVal = 0;
    for (const freq of currentChord) {
      // Warm Pipe Organ / Choir timbre:
      // Fundamental (1.0), 2nd harmonic (0.5), 3rd harmonic (0.25), 4th harmonic (0.1)
      // Soft tremolo vibrato
      const vibrato = 1.0 + 0.003 * Math.sin(2 * Math.PI * 5 * t);
      const f = freq * vibrato;

      const tone =
        Math.sin(2 * Math.PI * f * t) * 0.5 +
        Math.sin(2 * Math.PI * 2 * f * t) * 0.25 +
        Math.sin(2 * Math.PI * 3 * f * t) * 0.12 +
        Math.sin(2 * Math.PI * 4 * f * t) * 0.05;

      sampleVal += tone;
    }

    sampleVal = (sampleVal / (currentChord.length * 0.95)) * env;
    // Scale to 16-bit signed integer (-32768 to 32767)
    const intSample = Math.max(-32767, Math.min(32767, Math.floor(sampleVal * 28000)));
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

export function seedPresetAudioFiles() {
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const tracks = [
    {
      name: 'hymn-soalia.wav',
      // D major sacred hymn progression: D4, G4, A4, Bm, D4
      chords: [
        [293.66, 369.99, 440.0],
        [392.0, 493.88, 587.33],
        [440.0, 554.37, 659.25],
        [369.99, 440.0, 587.33],
        [293.66, 369.99, 440.0],
      ],
      duration: 25,
    },
    {
      name: 'hymn-mpiantsa.wav',
      // F major solemn choir progression: F4, Bb4, C5, Dm, F4
      chords: [
        [349.23, 440.0, 523.25],
        [466.16, 587.33, 698.46],
        [523.25, 659.25, 783.99],
        [440.0, 523.25, 698.46],
        [349.23, 440.0, 523.25],
      ],
      duration: 25,
    },
    {
      name: 'hymn-tomima.wav',
      // G major joyful youth progression: G4, C5, D5, Em, G4
      chords: [
        [392.0, 493.88, 587.33],
        [523.25, 659.25, 783.99],
        [587.33, 739.99, 880.0],
        [493.88, 587.33, 783.99],
        [392.0, 493.88, 587.33],
      ],
      duration: 25,
    },
    {
      name: 'hymn-asafa.wav',
      // C major grand choral anthem: C4, F4, G4, Am, C4
      chords: [
        [261.63, 329.63, 392.0],
        [349.23, 440.0, 523.25],
        [392.0, 493.88, 587.33],
        [440.0, 523.25, 659.25],
        [261.63, 329.63, 392.0],
      ],
      duration: 25,
    },
  ];

  for (const t of tracks) {
    const filePath = path.join(uploadsDir, t.name);
    if (!fs.existsSync(filePath)) {
      const buf = generateSacredHymnWav(t.chords, t.duration);
      fs.writeFileSync(filePath, buf);
      console.log(`[ASAFA Audio] Generated sample track ${t.name}`);
    }
  }
}
