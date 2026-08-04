import styles from './ToolBadges.module.css';

const TOOLS = [
  { name: 'Photoshop', mono: 'Ps', bg: '#001e36', fg: '#31c5f0' },
  { name: 'Illustrator', mono: 'Ai', bg: '#330000', fg: '#ff7c00' },
  { name: 'Figma', mono: 'Fi', bg: '#1e1e1e', fg: '#ffffff' },
];

export function ToolBadges() {
  return (
    <div className={styles.toolsRow}>
      {TOOLS.map((t) => (
        <span
          key={t.name}
          className={styles.badge}
          style={{ background: t.bg, color: t.fg }}
          title={t.name}
        >
          {t.mono}
          <span className="visually-hidden">{t.name}</span>
        </span>
      ))}
    </div>
  );
}
