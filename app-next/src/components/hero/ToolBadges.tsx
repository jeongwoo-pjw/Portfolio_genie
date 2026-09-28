import styles from './ToolBadges.module.css';

const TOOLS = [
  { name: 'Figma', src: '/images/tool-figma.png' },
  { name: 'VS Code', src: '/images/tool-vscode.png' },
  { name: 'Claude', src: '/images/tool-claude.png' },
  { name: 'Illustrator', src: '/images/tool-illustrator.png' },
];

export function ToolBadges() {
  return (
    <div className={styles.toolsRow}>
      {TOOLS.map((t) => (
        <span key={t.name} className={styles.badge} title={t.name}>
          <img src={t.src} className={styles.badgeImg} alt="" aria-hidden="true" />
          <span className="visually-hidden">{t.name}</span>
        </span>
      ))}
    </div>
  );
}
