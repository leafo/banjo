import React, { useState } from 'react';
import './App.css';

// Chromatic scale
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Banjo - Standard G tuning (gDGBD)
// String 5 (high G) starts at fret 5 (short string)
const BANJO_STRINGS = [
  { name: '5', openNote: 'G', startFret: 5 },  // Short string (high g)
  { name: '4', openNote: 'D', startFret: 0 },
  { name: '3', openNote: 'G', startFret: 0 },
  { name: '2', openNote: 'B', startFret: 0 },
  { name: '1', openNote: 'D', startFret: 0 },
];

// Guitar - Standard tuning (EADGBE) - low to high
const GUITAR_STRINGS = [
  { name: '6', openNote: 'E', startFret: 0 },  // Low E
  { name: '5', openNote: 'A', startFret: 0 },
  { name: '4', openNote: 'D', startFret: 0 },
  { name: '3', openNote: 'G', startFret: 0 },
  { name: '2', openNote: 'B', startFret: 0 },
  { name: '1', openNote: 'E', startFret: 0 },  // High E
];

// Instrument configurations
const INSTRUMENTS = {
  banjo: {
    name: 'Banjo',
    tuning: 'gDGBD',
    strings: BANJO_STRINGS,
  },
  guitar: {
    name: 'Guitar',
    tuning: 'EADGBE',
    strings: GUITAR_STRINGS,
  },
};

const NUM_FRETS = 15;

// Chords by key
// Scale notes by key (for scale degree display)
const SCALES = {
  G: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  C: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  D: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
};

const CHORDS_BY_KEY = {
  G: [
    { name: 'G', notes: ['G', 'B', 'D'], type: 'major', extension: { note: 'F#', type: 'maj7', notes: ['G', 'B', 'D', 'F#'] } },
    { name: 'Am', notes: ['A', 'C', 'E'], type: 'minor', extension: { note: 'G', type: 'm7', notes: ['A', 'C', 'E', 'G'] } },
    { name: 'Bm', notes: ['B', 'D', 'F#'], type: 'minor', extension: { note: 'A', type: 'm7', notes: ['B', 'D', 'F#', 'A'] } },
    { name: 'C', notes: ['C', 'E', 'G'], type: 'major', extension: { note: 'B', type: 'maj7', notes: ['C', 'E', 'G', 'B'] } },
    { name: 'D', notes: ['D', 'F#', 'A'], type: 'major', extension: { note: 'C', type: '7', notes: ['D', 'F#', 'A', 'C'] } },
    { name: 'Em', notes: ['E', 'G', 'B'], type: 'minor', extension: { note: 'D', type: 'm7', notes: ['E', 'G', 'B', 'D'] } },
    { name: 'F#dim', notes: ['F#', 'A', 'C'], type: 'dim' },
  ],
  C: [
    { name: 'C', notes: ['C', 'E', 'G'], type: 'major', extension: { note: 'B', type: 'maj7', notes: ['C', 'E', 'G', 'B'] } },
    { name: 'Dm', notes: ['D', 'F', 'A'], type: 'minor', extension: { note: 'C', type: 'm7', notes: ['D', 'F', 'A', 'C'] } },
    { name: 'Em', notes: ['E', 'G', 'B'], type: 'minor', extension: { note: 'D', type: 'm7', notes: ['E', 'G', 'B', 'D'] } },
    { name: 'F', notes: ['F', 'A', 'C'], type: 'major', extension: { note: 'E', type: 'maj7', notes: ['F', 'A', 'C', 'E'] } },
    { name: 'G', notes: ['G', 'B', 'D'], type: 'major', extension: { note: 'F', type: '7', notes: ['G', 'B', 'D', 'F'] } },
    { name: 'Am', notes: ['A', 'C', 'E'], type: 'minor', extension: { note: 'G', type: 'm7', notes: ['A', 'C', 'E', 'G'] } },
    { name: 'Bdim', notes: ['B', 'D', 'F'], type: 'dim' },
  ],
  D: [
    { name: 'D', notes: ['D', 'F#', 'A'], type: 'major', extension: { note: 'C#', type: 'maj7', notes: ['D', 'F#', 'A', 'C#'] } },
    { name: 'Em', notes: ['E', 'G', 'B'], type: 'minor', extension: { note: 'D', type: 'm7', notes: ['E', 'G', 'B', 'D'] } },
    { name: 'F#m', notes: ['F#', 'A', 'C#'], type: 'minor', extension: { note: 'E', type: 'm7', notes: ['F#', 'A', 'C#', 'E'] } },
    { name: 'G', notes: ['G', 'B', 'D'], type: 'major', extension: { note: 'F#', type: 'maj7', notes: ['G', 'B', 'D', 'F#'] } },
    { name: 'A', notes: ['A', 'C#', 'E'], type: 'major', extension: { note: 'G', type: '7', notes: ['A', 'C#', 'E', 'G'] } },
    { name: 'Bm', notes: ['B', 'D', 'F#'], type: 'minor', extension: { note: 'A', type: 'm7', notes: ['B', 'D', 'F#', 'A'] } },
    { name: 'C#dim', notes: ['C#', 'E', 'G'], type: 'dim' },
  ],
};

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

function getScaleDegree(note, scale) {
  const normalizedNote = normalizeNote(note);
  const index = scale.findIndex(n => normalizeNote(n) === normalizedNote);
  return index >= 0 ? index + 1 : null;
}

function Fretboard({ highlightedChord, showDegrees, selectedKey, pentatonic, strings }) {
  const highlightNotes = highlightedChord ? highlightedChord.notes : [];
  const scale = SCALES[selectedKey];

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
      {strings.map((string, stringIndex) => (
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

            const scaleDegree = getScaleDegree(note, scale);
            const isPentatonicDegree = scaleDegree !== null && scaleDegree !== 4 && scaleDegree !== 7;
            const isInScaleBase = pentatonic ? isPentatonicDegree : scaleDegree !== null;
            const isInScale = isInScaleBase || isHighlighted || isRootNote;
            const isScaleRoot = scaleDegree === 1;

            const noteClasses = ['note'];
            if (isRootNote) noteClasses.push('root');
            else if (isHighlighted) noteClasses.push('highlighted');
            else if (showDegrees && isScaleRoot) noteClasses.push('scale-root');
            if (showDegrees && !isInScale) noteClasses.push('not-in-scale');

            const displayText = showDegrees ? (isInScale ? (scaleDegree || note) : '') : note;

            return (
              <div key={fret} className={fretClasses.join(' ')}>
                <div className={noteClasses.join(' ')}>
                  {displayText}
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

function ChordList({ onChordHover, highlightedChord, selectedKey, onKeyChange, showDegrees, onToggleDegrees, pentatonic, onTogglePentatonic, instrument, onInstrumentChange }) {
  const chords = CHORDS_BY_KEY[selectedKey];

  return (
    <div className="chord-list">
      <div className="instrument-selector">
        <label htmlFor="instrument-select">Instrument:</label>
        <select
          id="instrument-select"
          value={instrument}
          onChange={(e) => onInstrumentChange(e.target.value)}
        >
          <option value="banjo">Banjo</option>
          <option value="guitar">Guitar</option>
        </select>
      </div>
      <div className="key-selector">
        <label htmlFor="key-select">Key:</label>
        <select
          id="key-select"
          value={selectedKey}
          onChange={(e) => onKeyChange(e.target.value)}
        >
          <option value="G">G Major</option>
          <option value="C">C Major</option>
          <option value="D">D Major</option>
        </select>
      </div>
      <div className="toggle-container">
        <label className="toggle">
          <input
            type="checkbox"
            checked={showDegrees}
            onChange={(e) => onToggleDegrees(e.target.checked)}
          />
          <span>Show scale degrees</span>
        </label>
        {showDegrees && (
          <label className="toggle">
            <input
              type="checkbox"
              checked={pentatonic}
              onChange={(e) => onTogglePentatonic(e.target.checked)}
            />
            <span>Pentatonic</span>
          </label>
        )}
      </div>
      <p className="chord-list-subtitle">Hover to highlight notes</p>
      {chords.map(chord => (
        <div key={chord.name} className="chord-row">
          <div
            className={`chord-item ${highlightedChord?.name === chord.name ? 'active' : ''}`}
            onMouseEnter={() => onChordHover(chord)}
            onMouseLeave={() => onChordHover(null)}
          >
            <span className="chord-name">{chord.name}</span>
            <span className="chord-notes">{chord.notes.join(' - ')}</span>
          </div>
          {chord.extension && (
            <div
              className={`chord-item chord-extension ${highlightedChord?.name === chord.name + chord.extension.type ? 'active' : ''}`}
              onMouseEnter={() => onChordHover({
                name: chord.name + chord.extension.type,
                notes: chord.extension.notes
              })}
              onMouseLeave={() => onChordHover(null)}
            >
              <span className="chord-name">{chord.extension.type}</span>
              <span className="chord-notes">{chord.extension.note}</span>
            </div>
          )}
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
  const [selectedKey, setSelectedKey] = useState('G');
  const [showDegrees, setShowDegrees] = useState(false);
  const [pentatonic, setPentatonic] = useState(false);
  const [instrument, setInstrument] = useState('banjo');

  const handleKeyChange = (key) => {
    setSelectedKey(key);
    setHighlightedChord(null);
  };

  const currentInstrument = INSTRUMENTS[instrument];

  return (
    <div className="container">
      <h1 className="title">{currentInstrument.name} Fretboard Visualizer</h1>
      <p className="subtitle">Standard Tuning ({currentInstrument.tuning})</p>
      <div className="main">
        <Fretboard
          highlightedChord={highlightedChord}
          showDegrees={showDegrees}
          selectedKey={selectedKey}
          pentatonic={pentatonic}
          strings={currentInstrument.strings}
        />
        <ChordList
          onChordHover={setHighlightedChord}
          highlightedChord={highlightedChord}
          selectedKey={selectedKey}
          onKeyChange={handleKeyChange}
          showDegrees={showDegrees}
          onToggleDegrees={setShowDegrees}
          pentatonic={pentatonic}
          onTogglePentatonic={setPentatonic}
          instrument={instrument}
          onInstrumentChange={setInstrument}
        />
      </div>
    </div>
  );
}
