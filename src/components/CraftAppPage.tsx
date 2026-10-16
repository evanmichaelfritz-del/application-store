import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GeistMono_500Medium } from '@expo-google-fonts/geist-mono/500Medium';
import { useFonts } from 'expo-font';
import { Link } from 'expo-router';
import { LeftNav } from '@/src/components/LeftNav';
import { TopNav } from '@/src/components/TopNav';
import {
  CRAFT_CATEGORY_LABEL,
  CRAFT_CATEGORY_SLUG,
  CRAFT_LICENSE,
  EARLY_ALPHA,
  EFFECTCRAFT_MCP,
  FILMCRAFT_MCP,
  craftBySlug,
  downloadsOf,
  type CraftApp,
  type CraftDownload,
} from '@/src/library/craftApps';
import { installStoreChromeCss } from '@/src/library/storeChromeCss';
import { EMPTY_FILTERS, galleryHref } from '@/src/library/taxonomy';
import { pressableWeb, textWeb } from '@/src/library/webProps';
import { colors, fonts, radii } from '@/src/theme';

function openExternal(url: string) {
  if (typeof window === 'undefined') return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function CraftAppPage({ slug }: { slug: string }) {
  useFonts({ GeistMono_500Medium });
  installStoreChromeCss();
  const app = craftBySlug(slug);
  const { width } = useWindowDimensions();
  const phone = width < 640;
  const compact = width < 880;
  const nav = <LeftNav typeSlug={CRAFT_CATEGORY_SLUG} filters={EMPTY_FILTERS} compact={compact} />;

  useEffect(() => {
    if (!app || typeof document === 'undefined') return;
    document.title = `${app.title} · Application Store`;
  }, [app]);

  if (!app) return null;

  const web = downloadsOf(app, 'web');
  const desktop = downloadsOf(app, 'desktop');
  const cli = downloadsOf(app, 'cli');
  const server = downloadsOf(app, 'server');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <TopNav />
      <View style={styles.body}>
        {compact ? null : nav}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.page, phone && styles.pagePhone]}
          showsVerticalScrollIndicator={false}
        >
          {compact ? nav : null}
          <Link href={galleryHref(CRAFT_CATEGORY_SLUG, EMPTY_FILTERS)} asChild>
            <Pressable accessibilityRole="link" style={styles.back} {...pressableWeb({ dataSet: { focusRing: 'true' } })}>
              <Text style={styles.backText}>{CRAFT_CATEGORY_LABEL}</Text>
            </Pressable>
          </Link>
          <Text style={styles.badge} testID="early-alpha">
            {EARLY_ALPHA}
          </Text>
          <Text style={styles.title} accessibilityRole="header" testID="craft-title">
            {app.title}
          </Text>
          <Text style={styles.description} testID="craft-description">
            {app.description}
          </Text>
          <ExternalLink href={app.repoUrl} testID="craft-repo">
            {app.repoUrl}
          </ExternalLink>
          <Text style={styles.release} testID="craft-release">
            <Text style={styles.releaseLink} accessibilityRole="link" onPress={() => openExternal(app.releaseUrl)} {...textWeb({ dataSet: { href: app.releaseUrl } })}>
              {app.releaseTag}
            </Text>
            <Text>{` · ${app.publishedOn}`}</Text>
          </Text>
          <Text style={styles.license} testID="craft-license">
            {CRAFT_LICENSE}
          </Text>
          <Text style={styles.notice} testID="craft-notice">
            {app.notice}
          </Text>
          <ExternalLink href={app.noticeUrl} testID="craft-notice-link">
            {app.noticeUrl}
          </ExternalLink>
          {web.length === 1 ? (
            <DownloadButton label="Download web build" url={web[0].url} testID="craft-web" />
          ) : null}
          <FileGroup label="Desktop" files={desktop} />
          <FileGroup label="CLI" files={cli} />
          <FileGroup label="" files={server} />
          <BotSection app={app} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function BotSection({ app }: { app: CraftApp }) {
  if (app.bot !== 'mcp') return null;
  const config = app.slug === 'film-craft' ? FILMCRAFT_MCP : app.slug === 'effect-craft' ? EFFECTCRAFT_MCP : null;
  if (config == null) return null;
  return (
    <View testID="craft-bot">
      <Text style={styles.section}>How a bot drives it</Text>
      <View style={styles.code}>
        <Text {...textWeb({ dataSet: { codeText: 'true' } })}>{config}</Text>
      </View>
    </View>
  );
}

function FileGroup({ label, files }: { label: string; files: readonly CraftDownload[] }) {
  if (files.length === 0) return null;
  return (
    <View style={styles.group}>
      {label ? <Text style={styles.section}>{label}</Text> : null}
      {files.map((file) => (
        <ExternalLink key={file.url} href={file.url}>
          {file.name}
        </ExternalLink>
      ))}
    </View>
  );
}

function DownloadButton({ label, url, testID }: { label: string; url: string; testID: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      testID={testID}
      onPress={() => openExternal(url)}
      {...pressableWeb({ dataSet: { focusRing: 'true', href: url } })}
      style={styles.button}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function ExternalLink({ href, children, testID }: { href: string; children: string; testID?: string }) {
  return (
    <Text
      accessibilityRole="link"
      testID={testID}
      onPress={() => openExternal(href)}
      {...textWeb({ dataSet: { href } })}
      style={styles.link}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
  body: { flex: 1, flexDirection: 'row', minHeight: 0 },
  scroll: { flex: 1, minWidth: 0 },
  page: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'flex-start',
    paddingTop: 24,
    paddingHorizontal: 32,
    paddingBottom: 80,
    boxSizing: 'border-box',
  },
  pagePhone: { paddingHorizontal: 16, paddingTop: 16 },
  back: { height: 20, marginBottom: 12, alignSelf: 'flex-start', justifyContent: 'center' },
  backText: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 20, color: colors.textSubtle },
  badge: {
    alignSelf: 'flex-start',
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.4,
    color: colors.text,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    marginTop: 8,
  },
  link: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    textDecorationLine: 'underline',
    marginTop: 10,
    cursor: 'pointer',
  },
  release: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    marginTop: 10,
  },
  releaseLink: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    textDecorationLine: 'underline',
    cursor: 'pointer',
  },
  license: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    marginTop: 18,
  },
  notice: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    marginTop: 8,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 20,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radii.control,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  buttonText: { fontFamily: fonts.medium, fontSize: 13, color: colors.proFg },
  group: { marginTop: 4 },
  section: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.text,
    marginTop: 28,
    marginBottom: 4,
  },
  code: {
    marginTop: 8,
    backgroundColor: colors.stage,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 16,
  },
});
