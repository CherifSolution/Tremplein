import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#1F2937',
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#6B7280',
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1E3A5F',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1E3A5F',
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#1F2937',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#1F2937',
    marginBottom: 3,
    marginLeft: 10,
  },
})

export type SimpleDocSection = {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

type SimpleDocumentProps = {
  eyebrow: string
  title: string
  intro?: string
  sections: SimpleDocSection[]
}

export function createSimpleDocument({ eyebrow, title, intro, sections }: SimpleDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        {intro ? <Text style={styles.paragraph}>{intro}</Text> : null}
        {sections.map((section, index) => (
          <View key={`${section.heading}-${index}`}>
            <Text style={styles.sectionTitle}>{section.heading}</Text>
            {section.paragraphs?.map((p, i) => (
              <Text key={i} style={styles.paragraph}>{p}</Text>
            ))}
            {section.bullets?.map((b, i) => (
              <Text key={i} style={styles.bullet}>• {b}</Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  )
}
