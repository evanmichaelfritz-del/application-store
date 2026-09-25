import { createElement, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stage } from '@/src/components/Stage';
import { writeClipboard } from '@/src/clipboard';
import { fonts } from '@/src/theme';
import {
  GUIDE,
  INK_TOOLS,
  SAMPLE_CONTROLS,
  agentNotesMarkdown,
  guideMarks,
  noteSelector,
  paintStrokes,
  type AgentNote,
  type Frame,
  type InkStroke,
  type InkTool,
} from './model';

export function PreviewToolsDemo() {
  const [open, setOpen] = useState(false);
  const [guidesOn, setGuidesOn] = useState(true);
  const [ink, setInk] = useState<InkTool>('pen');
  const [row, setRow] = useState<Frame | null>(null);
  const [locals, setLocals] = useState<Partial<Record<string, Frame>>>({});
  const [strokes, setStrokes] = useState<InkStroke[]>([]);
  const [draft, setDraft] = useState<PointStroke | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [notes, setNotes] = useState<AgentNote[]>([]);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fieldRef = useRef<View | null>(null);
  const openRef = useRef(open);
  const inkRef = useRef(ink);
  const strokesRef = useRef(strokes);
  const draftRef = useRef(draft);
  openRef.current = open;
  inkRef.current = ink;
  strokesRef.current = strokes;
  draftRef.current = draft;

  const frames = row
    ? SAMPLE_CONTROLS.flatMap((control) => {
        const local = locals[control.id];
        if (!local) return [];
        return [{ id: control.id, x: row.x + local.x, y: row.y + local.y, width: local.width, height: local.height }];
      })
    : [];
  const framesRef = useRef(frames);
  framesRef.current = frames;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = Math.round(parent.clientWidth);
      const height = Math.round(parent.clientHeight);
      if (width < 1 || height < 1) return;
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) return;
      const live = draftRef.current ? [...strokesRef.current, draftRef.current] : strokesRef.current;
      paintStrokes(context, live);
    };
    resize();
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return;
    const live = draft ? [...strokes, draft] : strokes;
    paintStrokes(context, live);
  }, [draft, strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.setProperty('pointer-events', open ? 'auto' : 'none', 'important');
  }, [open]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const localPoint = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const down = (event: PointerEvent) => {
      if (!openRef.current) return;
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        /* Untrusted pointer events cannot be captured. */
      }
      const next = { tool: inkRef.current, points: [localPoint(event)] };
      draftRef.current = next;
      setDraft(next);
    };
    const move = (event: PointerEvent) => {
      const current = draftRef.current;
      if (!current) return;
      const next = { tool: current.tool, points: [...current.points, localPoint(event)] };
      draftRef.current = next;
      setDraft(next);
    };
    const up = () => {
      const current = draftRef.current;
      if (!current) return;
      draftRef.current = null;
      setDraft(null);
      if (current.points.length > 1) {
        const committed = [...strokesRef.current, current];
        strokesRef.current = committed;
        setStrokes(committed);
      }
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    return () => {
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
    };
  }, []);

  const remember = (id: string) => (event: { nativeEvent: { layout: Frame } }) => {
    const next = roundFrame(event.nativeEvent.layout);
    setLocals((prev) => (sameFrame(prev[id], next) ? prev : { ...prev, [id]: next }));
  };

  const addNote = () => {
    const text = comment.trim();
    const control = SAMPLE_CONTROLS.find((item) => item.id === targetId);
    const box = framesRef.current.find((frame) => frame.id === targetId);
    if (!text || !control || !box) return;
    setNotes((prev) => [
      ...prev,
      { label: control.label, selector: noteSelector(control.id), comment: text, box },
    ]);
    setComment('');
  };

  const copyNotes = () => {
    const text = agentNotesMarkdown(notes);
    if (!text) return;
    writeClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Stage>
      <View ref={fieldRef} style={styles.field}>
        <View
          style={styles.row}
          onLayout={(event) => {
            const next = roundFrame(event.nativeEvent.layout);
            setRow((prev) => (sameFrame(prev, next) ? prev : next));
          }}
        >
          {SAMPLE_CONTROLS.map((control) => {
            const count = notes.filter((note) => note.selector === noteSelector(control.id)).length;
            const picked = open && targetId === control.id;
            return (
              <View
                key={control.id}
                onLayout={remember(control.id)}
                style={[
                  styles.ctrl,
                  control.kind === 'icon' && styles.icon,
                  control.kind === 'short' && styles.short,
                  control.kind === 'pill' && styles.pill,
                  control.kind === 'send' && styles.send,
                  picked && styles.picked,
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={control.label}
                  testID={`preview-tools-control-${control.id}`}
                  onPress={() => {
                    if (!open) return;
                    setTargetId(control.id);
                  }}
                  style={styles.hit}
                >
                  <Text style={[styles.label, control.kind === 'send' && styles.sendLabel]}>{control.label}</Text>
                </Pressable>
                {count > 0 ? <Text style={styles.badge}>{count}</Text> : null}
              </View>
            );
          })}
        </View>
        {createElement('canvas', {
          ref: canvasRef,
          'data-testid': 'preview-tools-canvas',
          style: {
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 4,
            pointerEvents: open ? 'auto' : 'none',
            touchAction: 'none',
          },
        })}
        {open && guidesOn && frames.length === SAMPLE_CONTROLS.length ? (
          <GuideOverlay frames={frames} />
        ) : null}
        <View style={[styles.dock, open && styles.dockOpen]}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
            accessibilityLabel={open ? 'Close tools' : 'Open tools'}
            testID="preview-tools-toggle"
            onPress={() => setOpen((value) => !value)}
            style={[styles.toggle, open && styles.toggleOn]}
          >
            <Text style={[styles.toggleText, open && styles.toggleTextOn]}>{open ? '×' : '+'}</Text>
          </Pressable>
          {open ? (
            <View style={styles.panel}>
              <View style={styles.tools}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: guidesOn }}
                  testID="preview-tools-guides"
                  onPress={() => setGuidesOn((value) => !value)}
                  style={[styles.chip, guidesOn && styles.chipOn]}
                >
                  <Text style={[styles.chipText, guidesOn && styles.chipTextOn]}>Guides</Text>
                </Pressable>
                {INK_TOOLS.map((item) => {
                  const on = ink === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      testID={`preview-tools-ink-${item.id}`}
                      onPress={() => setInk(item.id)}
                      style={[styles.chip, on && styles.chipOn]}
                    >
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>{item.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.noteBar}>
                <Text style={styles.target} numberOfLines={1}>
                  {SAMPLE_CONTROLS.find((item) => item.id === targetId)?.label ?? 'Click a control'}
                </Text>
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Note for the agent"
                  testID="preview-tools-note-input"
                  style={styles.input}
                  onSubmitEditing={addNote}
                />
                <Pressable accessibilityRole="button" testID="preview-tools-note-add" onPress={addNote} style={styles.chip}>
                  <Text style={styles.chipText}>Add</Text>
                </Pressable>
                <Pressable accessibilityRole="button" testID="preview-tools-note-copy" onPress={copyNotes} style={styles.chip}>
                  <Text style={styles.chipText}>{copied ? 'Copied' : 'Copy'}</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Stage>
  );
}

type PointStroke = InkStroke;

function GuideOverlay({ frames }: { frames: Frame[] }) {
  return (
    <View pointerEvents="none" style={styles.overlay}>
      {guideMarks(frames).map((mark) => {
        if (mark.kind === 'h') return <View key={`h-${mark.y}`} style={[styles.h, { top: mark.y }]} />;
        if (mark.kind === 'v') return <View key={`v-${mark.x}`} style={[styles.v, { left: mark.x }]} />;
        const frame = mark.frame;
        return (
          <View
            key={`b-${frame.x}-${frame.y}`}
            style={[styles.box, { left: frame.x, top: frame.y, width: frame.width, height: frame.height }]}
          />
        );
      })}
    </View>
  );
}

function roundFrame(frame: Frame): Frame {
  return {
    x: Math.round(frame.x),
    y: Math.round(frame.y),
    width: Math.round(frame.width),
    height: Math.round(frame.height),
  };
}

function sameFrame(prev: Frame | null | undefined, next: Frame): boolean {
  return !!prev && prev.x === next.x && prev.y === next.y && prev.width === next.width && prev.height === next.height;
}

const styles = StyleSheet.create({
  field: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dock: {
    position: 'absolute',
    zIndex: 6,
    bottom: 12,
    alignSelf: 'center',
  },
  dockOpen: {
    left: 8,
    right: 8,
    bottom: 8,
    alignSelf: 'auto',
  },
  toggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    boxShadow: '0 4px 16px rgba(23,24,28,0.12)',
    cursor: 'pointer',
  },
  toggleOn: { backgroundColor: '#17181c', borderColor: '#17181c' },
  toggleText: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 20, color: '#17181c' },
  toggleTextOn: { color: '#fff' },
  panel: { marginTop: 6, gap: 4 },
  tools: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 4 },
  noteBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    zIndex: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(249,249,249,0.92)',
    borderRadius: 10,
    padding: 4,
  },
  chip: {
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  chipOn: { backgroundColor: '#17181c', borderColor: '#17181c' },
  chipText: { fontFamily: fonts.medium, fontSize: 12, color: '#17181c' },
  chipTextOn: { color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 5 },
  hit: { alignItems: 'center', justifyContent: 'center' },
  ctrl: {
    position: 'relative',
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  icon: { width: 32, height: 32 },
  short: { height: 26, paddingHorizontal: 12 },
  pill: { height: 32, paddingHorizontal: 12 },
  send: { width: 32, height: 32, backgroundColor: '#17181c', borderColor: '#17181c' },
  picked: { outlineWidth: 2, outlineColor: GUIDE, outlineStyle: 'solid', outlineOffset: 2 },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: '#17181c' },
  sendLabel: { color: '#fff' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: GUIDE,
    color: '#fff',
    fontFamily: fonts.semibold,
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
    overflow: 'hidden',
    paddingHorizontal: 3,
  },
  target: { fontFamily: fonts.medium, fontSize: 11, color: '#6c6c6c', maxWidth: 72 },
  input: {
    flex: 1,
    minWidth: 0,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 8,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#17181c',
    backgroundColor: '#fff',
  },
  overlay: { ...StyleSheet.absoluteFill, zIndex: 5 },
  h: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: GUIDE },
  v: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: GUIDE },
  box: { position: 'absolute', borderWidth: 1, borderColor: GUIDE },
});
