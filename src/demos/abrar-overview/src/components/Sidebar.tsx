import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { IonName } from '../data/overview';
import { sidebar } from '../data/overview';
import { SIDEBAR_WIDTH, colors } from '../theme';
import { Tap, Tx, cardShadow, hairline } from './ui';

type NavSpec = {
  id: string;
  label: string;
  icon: IonName;
  badge?: number;
  trailing?: string;
};

const essentials: NavSpec[] = [
  { id: 'overview', label: 'Overview', icon: 'grid-outline' },
  { id: 'messages', label: 'Messages', icon: 'chatbubble-outline', badge: sidebar.messagesBadge },
  { id: 'agent', label: 'AI agent', icon: 'sparkles-outline' },
];

const workItems: NavSpec[] = [
  { id: 'discover', label: 'Discover', icon: 'compass-outline' },
  { id: 'campaigns', label: 'Campaigns', icon: 'megaphone-outline' },
  { id: 'matching', label: 'Matching', icon: 'people-outline' },
  { id: 'outreach', label: 'Outreach', icon: 'paper-plane-outline' },
];

function WorkspaceMark() {
  return (
    <View style={styles.workspaceMark}>
      <View style={styles.workspaceGlyph} />
    </View>
  );
}

function SetupRing() {
  const size = 16;
  const stroke = 2;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = sidebar.setupStep / sidebar.setupTotal;
  const dash = c * progress;
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.grey200} strokeWidth={stroke} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={colors.text}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

function NavRow({ item, active }: { item: NavSpec; active?: boolean }) {
  return (
    <Tap
      accessibilityLabel={item.label}
      pressedColor={colors.grey200}
      style={[styles.nav, active && styles.navActive]}
      onPress={() => {
        /* Non-Overview items stay on this screen. */
      }}
    >
      <Ionicons name={item.icon} size={16} color={active ? colors.text : colors.nav} />
      <Tx weight={active ? 600 : 500} size={13} color={active ? colors.text : colors.nav}>
        {item.label}
      </Tx>
      {item.badge != null ? (
        <View style={styles.badge}>
          <Tx weight={600} size={11} color={colors.white}>
            {item.badge}
          </Tx>
        </View>
      ) : null}
      <View style={{ flex: 1 }} />
      {item.trailing ? (
        <Tx size={12} weight={400} color={colors.muted}>
          {item.trailing}
        </Tx>
      ) : null}
    </Tap>
  );
}

export function Sidebar() {
  const [workOpen, setWorkOpen] = useState(true);

  return (
    <View style={styles.sidebar}>
      <View style={styles.switcherRow}>
        <Tap style={styles.switcher} pressedColor={colors.grey200} accessibilityLabel="Creator, Brand workspace">
          <WorkspaceMark />
          <View style={{ flex: 1 }}>
            <Tx weight={600} size={13}>
              {sidebar.workspace}
            </Tx>
            <Tx size={12} color={colors.secondary}>
              {sidebar.workspaceSub}
            </Tx>
          </View>
        </Tap>
        <Tap style={styles.iconHit} pressedColor={colors.grey200} accessibilityLabel="Collapse sidebar">
          <View style={styles.panelIcon}>
            <View style={styles.panelIconBar} />
          </View>
        </Tap>
      </View>

      <Tap style={styles.search} pressedColor={colors.grey300} accessibilityLabel="Search">
        <Ionicons name="search-outline" size={15} color={colors.muted} />
        <Tx size={13} color={colors.muted} style={{ flex: 1 }}>
          Search
        </Tx>
        <View style={styles.keyChip}>
          <Tx size={12} weight={500} color={colors.secondary}>
            /
          </Tx>
        </View>
      </Tap>

      <Tx size={12} weight={500} color={colors.muted} style={styles.section}>
        Essentials
      </Tx>
      {essentials.map((item) => (
        <NavRow key={item.id} item={item} active={item.id === 'overview'} />
      ))}

      <View style={styles.groupRule} />
      <Tap
        style={styles.workHeader}
        pressedColor={colors.grey200}
        onPress={() => setWorkOpen((open) => !open)}
        accessibilityLabel="Work"
      >
        <Tx size={12} weight={500} color={colors.muted}>
          Work
        </Tx>
        <Ionicons name={workOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.muted} />
      </Tap>
      {workOpen
        ? workItems.map((item) => <NavRow key={item.id} item={item} />)
        : null}

      <View style={styles.groupRule} />
      <View style={styles.workHeader}>
        <Tx size={12} weight={500} color={colors.muted}>
          Measure
        </Tx>
        <Ionicons name="chevron-up" size={14} color={colors.muted} />
      </View>
      <NavRow item={{ id: 'performance', label: 'Performances', icon: 'bar-chart-outline' }} />

      <View style={styles.groupRule} />
      <View style={styles.workHeader}>
        <Tx size={12} weight={500} color={colors.muted}>
          Account
        </Tx>
        <Ionicons name="chevron-up" size={14} color={colors.muted} />
      </View>
      <NavRow
        item={{
          id: 'creators',
          label: 'Creators',
          icon: 'person-outline',
          trailing: String(sidebar.creatorsCount),
        }}
      />
      <NavRow item={{ id: 'brand', label: 'Brand settings', icon: 'options-outline' }} />

      <View style={{ flexGrow: 1, minHeight: 12 }} />

      <View style={styles.setupCard}>
        <View style={styles.setupArt}>
          <Svg width="100%" height="100%" viewBox="0 0 216 96" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="setupSky" x1="0" y1="1" x2="1" y2="0">
                <Stop offset="0" stopColor="#F8D2A8" />
                <Stop offset="0.48" stopColor="#F6E6D4" />
                <Stop offset="1" stopColor="#D5E4F6" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="216" height="96" fill="url(#setupSky)" />
            <Ellipse cx="54" cy="38" rx="36" ry="14" fill="#FFFFFF" opacity={0.78} />
            <Ellipse cx="78" cy="34" rx="22" ry="12" fill="#FFFFFF" opacity={0.55} />
            <Ellipse cx="158" cy="42" rx="30" ry="13" fill="#FFFFFF" opacity={0.7} />
            <Ellipse cx="132" cy="30" rx="16" ry="8" fill="#FFFFFF" opacity={0.45} />
          </Svg>
          <View style={styles.gaCircle}>
            <View style={styles.gaBars}>
              <View style={[styles.gaBar, { height: 8 }]} />
              <View style={[styles.gaBar, { height: 14 }]} />
              <View style={[styles.gaBar, { height: 11 }]} />
            </View>
          </View>
          <Tap variant="black" style={styles.connect} accessibilityLabel="Connect">
            <Tx size={12} weight={600} color={colors.white}>
              Connect
            </Tx>
          </Tap>
        </View>
        <View style={styles.setupBody}>
          <Tx size={14} weight={600}>
            Finish setup
          </Tx>
          <Tx size={12} color={colors.secondary} style={{ marginTop: 2 }}>
            Connect Google Analytics for web conversions.
          </Tx>
          <View style={styles.setupRow}>
            <View style={styles.setupProgress}>
              <SetupRing />
              <Tx size={12} weight={500} color={colors.nav}>
                {sidebar.setupStep} of {sidebar.setupTotal}
              </Tx>
            </View>
            <View style={styles.setupActions}>
              <Tap style={styles.skip} accessibilityLabel="Skip">
                <Tx size={12} weight={500} color={colors.secondary}>
                  Skip
                </Tx>
              </Tap>
              <Tap variant="black" style={styles.next} accessibilityLabel="Next">
                <Tx size={12} weight={600} color={colors.white}>
                  Next
                </Tx>
              </Tap>
            </View>
          </View>
        </View>
      </View>

      <NavRow item={{ id: 'appearance', label: 'Appearance', icon: 'sunny-outline' }} />
      <NavRow item={{ id: 'help', label: 'Help & support', icon: 'help-circle-outline' }} />

      <Tap style={styles.profile} pressedColor={colors.grey200} accessibilityLabel="Maria Bell, Plan and billing">
        <Image source={require('../../assets/maria-bell.png')} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Tx size={13} weight={600}>
            Maria Bell
          </Tx>
          <Tx size={12} color={colors.secondary}>
            Plan & billing
          </Tx>
        </View>
        <Ionicons name="ellipsis-vertical" size={16} color={colors.muted} />
      </Tap>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.page,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  switcherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switcher: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  workspaceMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceGlyph: {
    width: 14,
    height: 10,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  iconHit: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelIcon: {
    width: 15,
    height: 15,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: colors.nav,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  panelIconBar: {
    width: 5,
    backgroundColor: colors.nav,
    opacity: 0.35,
  },
  search: {
    marginTop: 8,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.grey200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  keyChip: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  groupRule: {
    height: 1,
    marginTop: 8,
    marginBottom: 2,
    marginHorizontal: 8,
    backgroundColor: colors.grey200,
  },
  workHeader: {
    marginTop: 4,
    height: 28,
    borderRadius: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nav: {
    height: 32,
    borderRadius: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navActive: {
    backgroundColor: colors.white,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.06)',
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    marginBottom: 8,
    ...cardShadow,
  },
  setupArt: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 14,
  },
  gaBar: {
    width: 4,
    borderRadius: 1,
    backgroundColor: colors.orange,
  },
  connect: {
    position: 'absolute',
    bottom: 8,
    height: 26,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  setupRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setupProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  setupActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skip: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  next: {
    height: 26,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profile: {
    marginTop: 4,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.grey200,
  },
});
