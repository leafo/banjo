import React, { useState } from 'react';
import './App.css';

// Chromatic scale
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Standard G tuning - strings from left to right as you face the banjo
// String 4 (D), String 3 (G), String 2 (B), String 1 (D)
// String 5 (high G) starts at fret 5
const STRINGS = [
  { name: '5', openNote: 'G', startFret: 5 },  // Short string (high g)
  { name: '4', openNote: 'D', startFret: 0 },
  { name: '3', openNote: 'G', startFret: 0 },
  { name: '2', openNote: 'B', startFret: 0 },
  { name: '1', openNote: 'D', startFret: 0 },
];

const NUM_FRETS = 15;

// Chords in the key of G major
const CHORDS = [
  { name: 'G', notes: ['G', 'B', 'D'], type: 'major' },
  { name: 'Am', notes: ['A', 'C', 'E'], type: 'minor' },
  { name: 'Bm', notes: ['B', 'D', 'F#'], type: 'minor' },
  { name: 'C', notes: ['C', 'E', 'G'], type: 'major' },
  { name: 'D', notes: ['D', 'F#', 'A'], type: 'major' },
  { name: 'Em', notes: ['E', 'G', 'B'], type: 'minor' },
  { name: 'F#dim', notes: ['F#', 'A', 'C'], type: 'dim' },
];

function getNoteAtFret(openNote, fret) {
  const startIndex = NOTES.indexOf(openNote);
  return NOTES[(startIndex + fret) % 12];
}

// Normalize note names for comparison (handle enharmonics)
function normalizeNote(note) {
  const enharmonics = {
    'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#',
    'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B',
    'E#': 'F', 'B#': 'C'
  };
  return enharmonics[note] || note;
}

function isNoteInChord(note, chordNotes) {
  const normalizedNote = normalizeNote(note);
  return chordNotes.some(cn => normalizeNote(cn) === normalizedNote);
}

function Fretboard({ highlightedChord }) {
  const highlightNotes = highlightedChord ? highlightedChord.notes : [];

  return (
    <div className="fretboard-container">
      {/* Fret numbers column */}
      <div className="fret-number-column">
        {Array.from({ length: NUM_FRETS + 1 }, (_, fret) => (
          <div key={fret} className="fret-number">
            {fret === 0 ? 'Open' : fret}
          </div>
        ))}
      </div>

      {/* String columns */}
      {STRINGS.map((string, stringIndex) => (
        <div key={string.name} className="string-column">
          {/* Frets */}
          {Array.from({ length: NUM_FRETS + 1 }, (_, fret) => {
            // For 5th string, only show from fret 5 onwards
            if (string.startFret > 0 && fret < string.startFret) {
              return <div key={fret} className="empty-fret"></div>;
            }

            const actualFret = fret - string.startFret;
            const note = getNoteAtFret(string.openNote, actualFret);
            const isHighlighted = highlightNotes.length > 0 && isNoteInChord(note, highlightNotes);
            const isOpen = fret === string.startFret;
            const isRootNote = highlightedChord && normalizeNote(note) === normalizeNote(highlightedChord.notes[0]);

            const fretClasses = ['fret'];
            if (isOpen) fretClasses.push('open-fret');
            if (fret === 0 || fret === string.startFret) fretClasses.push('nut');

            const noteClasses = ['note'];
            if (isRootNote) noteClasses.push('root');
            else if (isHighlighted) noteClasses.push('highlighted');

            return (
              <div key={fret} className={fretClasses.join(' ')}>
                <div className={noteClasses.join(' ')}>
                  {note}
                </div>
                {fret > 0 && fret !== string.startFret && <div className="fret-wire"></div>}
                <div className={`string-line ${stringIndex === 0 ? 'thin' : ''}`}></div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Fret markers column */}
      <div className="fret-marker-column">
        {Array.from({ length: NUM_FRETS + 1 }, (_, fret) => (
          <div key={fret} className="fret-marker-cell">
            {[3, 5, 7, 10, 12, 15].includes(fret) && (
              fret === 12 ? (
                <div className="double-marker">
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <div className="fret-marker"></div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChordList({ onChordHover, highlightedChord }) {
  return (
    <div className="chord-list">
      <h3 className="chord-list-title">Chords in G Major</h3>
      <p className="chord-list-subtitle">Hover to highlight notes</p>
      {CHORDS.map(chord => (
        <div
          key={chord.name}
          className={`chord-item ${highlightedChord?.name === chord.name ? 'active' : ''}`}
          onMouseEnter={() => onChordHover(chord)}
          onMouseLeave={() => onChordHover(null)}
        >
          <span className="chord-name">{chord.name}</span>
          <span className="chord-notes">{chord.notes.join(' - ')}</span>
        </div>
      ))}
      <div className="legend">
        <h4 className="legend-title">Legend</h4>
        <div className="legend-item">
          <div className="legend-dot root"></div>
          <span>Root note</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot highlighted"></div>
          <span>Chord tone</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [highlightedChord, setHighlightedChord] = useState(null);

  return (
    <div className="container">
      <h1 className="title">Banjo Fretboard Visualizer</h1>
      <p className="subtitle">Standard G Tuning (gDGBD)</p>
      <div className="main">
        <Fretboard highlightedChord={highlightedChord} />
        <ChordList
          onChordHover={setHighlightedChord}
          highlightedChord={highlightedChord}
        />
      </div>
    </div>
  );
}
