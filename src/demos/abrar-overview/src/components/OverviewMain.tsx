import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  actionCards,
  campaigns,
  filters,
  hexLegend,
  hexTotal,
  kpis,
  type CampaignFilter,
  type DeltaTone,
} from '../data/overview';
import { colors } from '../theme';
import { HexCluster } from './HexCluster';
import { RevenueChart } from './RevenueChart';
import { Tap, Tx, cardShadow, hairline } from './ui';

const SWATCH: Record<string, string> = {
  B: colors.blue,
  O: colors.orange,
  T: colors.teal,
  P: colors.purple,
};

function deltaColor(tone: DeltaTone) {
  if (tone === 'up') return colors.green;
  if (tone === 'down') return colors.red;
  return colors.muted;
}

/** Same green and red as the legend direction marks. Flat is a grey minus. */
function deltaMark(tone: DeltaTone): { color: string; icon: 'arrow-up' | 'arrow-down' | 'remove' } {
  if (tone === 'up') return { color: colors.greenDot, icon: 'arrow-up' };
  if (tone === 'down') return { color: colors.red, icon: 'arrow-down' };
  return { color: colors.secondary, icon: 'remove' };
}

export function OverviewMain() {
  const [filter, setFilter] = useState<CampaignFilter>('all');

  return (
    <View style={styles.main}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Ionicons name="grid-outline" size={16} color={colors.text} />
          <Tx size={16} weight={600}>
            Overview
          </Tx>
        </View>
        <View style={styles.headerActions}>
          <Tap style={styles.iconButton} accessibilityLabel="Refresh">
            <Ionicons name="refresh-outline" size={16} color={colors.nav} />
          </Tap>
          <Tap style={styles.iconButton} accessibilityLabel="Share">
            <Ionicons name="share-outline" size={16} color={colors.nav} />
          </Tap>
        </View>
      </View>

      <View style={styles.filters}>
        <Tap style={styles.datePill} accessibilityLabel="Last 30 days">
          <Ionicons name="calendar-outline" size={14} color={colors.nav} />
          <Tx size={13} weight={500} color={colors.nav}>
            Last 30 days
          </Tx>
        </Tap>
        <View style={styles.segment}>
          {filters.map((item) => {
            const active = filter === item.id;
            return (
              <Tap
                key={item.id}
                onPress={() => setFilter(item.id)}
                pressedColor={active ? colors.grey100 : colors.grey200}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityLabel={item.label}
              >
                <Tx size={13} weight={active ? 600 : 500} color={active ? colors.text : colors.nav}>
                  {item.label}
                </Tx>
                {item.dot ? <View style={styles.needsDot} /> : null}
              </Tap>
            );
          })}
        </View>
      </View>

      <View style={styles.cardRow}>
        {actionCards.map((card) => (
          <View key={card.id} style={styles.actionCard}>
            <View style={styles.actionHead}>
              <View style={[styles.tile, { backgroundColor: card.tile }]}>
                <Ionicons name={card.icon} size={14} color={colors.white} />
              </View>
              <Tx size={13} weight={500} color={colors.nav} style={{ flex: 1 }} numberOfLines={1}>
                {card.label}
              </Tx>
            </View>
            <View style={styles.actionBody}>
              <View style={{ flex: 1 }}>
                <View style={styles.valueRow}>
                  <Tx size={24} weight={600} numeric>
                    {card.value}
                  </Tx>
                  {card.unit ? (
                    <Tx size={12} color={colors.secondary}>
                      {card.unit}
                    </Tx>
                  ) : null}
                </View>
                <Tx size={12} color={colors.secondary} style={{ marginTop: 2 }}>
                  {card.note}
                </Tx>
              </View>
              {card.actionKind === 'black' ? (
                <Tap variant="black" style={styles.blackPill} accessibilityLabel={card.action}>
                  <Tx size={13} weight={500} color={colors.white}>
                    {card.action}
                  </Tx>
                </Tap>
              ) : (
                <Tap style={styles.outlinePill} accessibilityLabel={card.action}>
                  <Tx size={13} weight={500} color={colors.text}>
                    {card.action}
                  </Tx>
                </Tap>
              )}
            </View>
          </View>
        ))}
      </View>

      <Tx size={14} weight={600} style={styles.sectionLabel}>
        Performance
      </Tx>
      <View style={styles.cardRow}>
        {kpis.map((kpi) => {
          const mark = deltaMark(kpi.tone);
          return (
            <View key={kpi.id} style={styles.kpi}>
              <View style={styles.kpiHead}>
                <Ionicons name={kpi.icon} size={14} color={colors.secondary} />
                <Tx size={13} weight={500} color={colors.nav} numberOfLines={1}>
                  {kpi.label}
                </Tx>
              </View>
              <View style={styles.kpiBody}>
                <Tx size={24} weight={600} numeric>
                  {kpi.value}
                </Tx>
                <View style={styles.deltaRow}>
                  <View style={styles.deltaLead}>
                    <View style={[styles.deltaMark, { backgroundColor: mark.color }]}>
                      <Ionicons name={mark.icon} size={8} color={colors.white} />
                    </View>
                    <Tx size={12} weight={kpi.tone === 'flat' ? 500 : 600} color={deltaColor(kpi.tone)}>
                      {kpi.delta}
                    </Tx>
                  </View>
                  {kpi.baseline ? (
                    <Tx size={12} color={colors.secondary}>
                      {kpi.baseline}
                    </Tx>
                  ) : null}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.cardRow, { alignItems: 'stretch' }]}>
        <View style={[styles.chartCard, { flex: 55 }]}>
          <View style={styles.chartHead}>
            <Tx size={13} weight={500} color={colors.secondary}>
              Attributed revenue
            </Tx>
            <Tap style={styles.link} accessibilityLabel="View full report">
              <Tx size={13} weight={500} color={colors.secondary}>
                View full report →
              </Tx>
            </Tap>
          </View>
          <Tx size={24} weight={600} numeric style={{ marginTop: 2 }}>
            {hexTotal}
          </Tx>
          <HexCluster />
          <View style={styles.legend}>
            {hexLegend.map((row, index) => (
              <View
                key={row.name}
                style={[styles.legendRow, index < hexLegend.length - 1 && styles.legendDivider]}
              >
                <View style={[styles.swatch, { backgroundColor: SWATCH[row.swatch] }]} />
                <Tx size={13} weight={500} numberOfLines={1} style={{ flexShrink: 1 }}>
                  {row.name}
                </Tx>
                {row.percent ? (
                  <View style={styles.percentChip}>
                    <Tx size={11} weight={600} color={colors.nav}>
                      {row.percent}
                    </Tx>
                  </View>
                ) : null}
                <View style={{ flex: 1 }} />
                <Tx size={13} weight={600} numeric>
                  {row.amount}
                </Tx>
                <View
                  style={[
                    styles.dirCircle,
                    { backgroundColor: row.direction === 'up' ? colors.greenDot : colors.red },
                  ]}
                >
                  <Ionicons
                    name={row.direction === 'up' ? 'arrow-up' : 'arrow-down'}
                    size={10}
                    color={colors.white}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.chartCard, { flex: 45 }]}>
          <Tx size={13} weight={500} color={colors.secondary}>
            Revenue over time
          </Tx>
          <View style={styles.valueRow}>
            <Tx size={24} weight={600} numeric>
              $18,420
            </Tx>
            <Tx size={12} color={colors.secondary}>
              $614 avg/day
            </Tx>
          </View>
          <View style={{ marginTop: 8 }}>
            <RevenueChart />
          </View>
        </View>
      </View>

      <Tx size={14} weight={600} style={styles.sectionLabel}>
        Campaigns that need you
      </Tx>
      <View style={styles.tableCard}>
        <View style={styles.tableHead}>
          <Tx size={12} weight={500} color={colors.muted} style={{ flex: 1.5 }}>
            Campaign
          </Tx>
          <Tx size={12} weight={500} color={colors.muted} style={{ flex: 1.3 }}>
            Waiting on you
          </Tx>
          <Tx size={12} weight={500} color={colors.muted} style={{ flex: 0.8 }}>
            Live posts
          </Tx>
          <Tx size={12} weight={500} color={colors.muted} style={{ flex: 1 }}>
            Budget used
          </Tx>
          <Tx size={12} weight={500} color={colors.muted} style={{ flex: 0.8 }}>
            Revenue
          </Tx>
        </View>
        {campaigns.map((row, index) => (
          <Tap
            key={row.id}
            style={[styles.tableRow, index < campaigns.length - 1 && styles.tableDivider]}
            accessibilityLabel={row.name}
          >
            <View style={[styles.campaignCell, { flex: 1.5 }]}>
              <View style={[styles.letter, { backgroundColor: row.tile }]}>
                <Tx size={13} weight={600} color={colors.white}>
                  {row.letter}
                </Tx>
              </View>
              <View style={{ flex: 1 }}>
                <Tx size={13} weight={600} numberOfLines={1}>
                  {row.name}
                </Tx>
                <View style={styles.statusLine}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: row.statusTone === 'active' ? colors.greenDot : colors.orangeDeep },
                    ]}
                  />
                  <Tx size={12} color={colors.secondary} numberOfLines={1}>
                    {row.status}
                  </Tx>
                </View>
              </View>
            </View>
            <View style={{ flex: 1.3 }}>
              <Tx
                size={13}
                weight={500}
                color={row.waitingCount === '—' ? colors.muted : colors.text}
                numeric
              >
                {row.waitingCount}
              </Tx>
              {row.waitingNote ? (
                <Tx size={12} color={colors.secondary}>
                  {row.waitingNote}
                </Tx>
              ) : null}
            </View>
            <View style={{ flex: 0.8 }}>
              <Tx size={13} weight={500} color={row.livePosts === '—' ? colors.muted : colors.text} numeric>
                {row.livePosts}
              </Tx>
              {row.liveNote ? (
                <Tx size={12} color={colors.secondary}>
                  {row.liveNote}
                </Tx>
              ) : null}
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              {row.budgetUsed == null ? (
                <Tx size={13} weight={500} color={colors.muted}>
                  —
                </Tx>
              ) : (
                <>
                  <Tx size={13} weight={500} numeric>
                    {row.budgetUsed}% used
                  </Tx>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${row.budgetUsed}%`,
                          backgroundColor: row.budgetUsed > 90 ? colors.orange : colors.greenDot,
                        },
                      ]}
                    />
                  </View>
                </>
              )}
            </View>
            <View style={{ flex: 0.8 }}>
              <Tx size={13} weight={600} color={row.revenue === '—' ? colors.muted : colors.text} numeric>
                {row.revenue}
              </Tx>
              {row.revenueDelta ? (
                <Tx size={12} weight={600} color={colors.green}>
                  {row.revenueDelta}
                </Tx>
              ) : null}
            </View>
          </Tap>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    marginTop: 8,
    marginRight: 8,
    marginBottom: 8,
    marginLeft: 8,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 36,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datePill: {
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grey100,
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  chip: {
    height: 28,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipActive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  },
  needsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.redDot,
  },
  cardRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.cardBorder,
    padding: 12,
    ...cardShadow,
  },
  actionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tile: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBody: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  blackPill: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  outlinePill: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionLabel: {
    marginTop: 10,
    marginBottom: 0,
  },
  kpi: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    ...cardShadow,
  },
  kpiHead: {
    height: 34,
    backgroundColor: colors.headerStrip,
    borderBottomWidth: hairline,
    borderBottomColor: colors.cardBorder,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kpiBody: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
  },
  deltaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  deltaLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deltaMark: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.cardBorder,
    padding: 12,
    ...cardShadow,
  },
  chartHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  link: {
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  legend: {
    marginTop: 4,
    backgroundColor: colors.legend,
    borderRadius: 10,
    overflow: 'hidden',
  },
  legendRow: {
    minHeight: 28,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDivider: {
    borderBottomWidth: hairline,
    borderBottomColor: colors.cardBorder,
  },
  swatch: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  percentChip: {
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: colors.grey100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dirCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableCard: {
    marginTop: 4,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    ...cardShadow,
  },
  tableHead: {
    height: 36,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.legend,
    borderBottomWidth: hairline,
    borderBottomColor: colors.cardBorder,
  },
  tableRow: {
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  tableDivider: {
    borderBottomWidth: hairline,
    borderBottomColor: colors.cardBorder,
  },
  campaignCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 8,
  },
  letter: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  barTrack: {
    marginTop: 4,
    width: 88,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grey200,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
});
