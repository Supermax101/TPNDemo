import React from 'react';
import { 
  Modal, 
  Text, 
  Stack, 
  Group, 
  Anchor, 
  Divider, 
  Box,
  Badge,
  Card
} from '@mantine/core';
import { IconBook, IconExternalLink } from '@tabler/icons-react';

interface Reference {
  title: string;
  authors?: string;
  journal?: string;
  year?: string;
  volume?: string;
  pages?: string;
  url?: string;
  doi?: string;
  description?: string;
}

interface ReferencesModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function ReferencesModal({ opened, onClose }: ReferencesModalProps) {
  
  const references: Reference[] = [
    {
      title: "Parenteral Nutrition in the Pediatric Nutrition Handbook (6th ed., pp. 519-540)",
      authors: "American Academy of Pediatrics Committee on Nutrition",
      journal: "Elk Grove Village, IL: American Academy of Pediatrics",
      year: "2009",
      description: "Comprehensive guidelines for pediatric parenteral nutrition practices",
      url: "https://publications.aap.org/"
    },
    {
      title: "A.S.P.E.N. Clinical Guidelines: Nutrition Support of Neonatal Patients at Risk for Necrotizing Enterocolitis",
      authors: "Mirtallo JM, Holcombe B, Kochevar M, et al.",
      journal: "JPEN J Parenter Enteral Nutr",
      year: "2012",
      volume: "36",
      pages: "506-523",
      doi: "10.1177/0148607112449482",
      description: "Evidence-based guidelines for TPN in high-risk neonates"
    },
    {
      title: "Parenteral Nutrition: Theory and Practice",
      authors: "Rombeau JL, Rolandelli RH",
      journal: "Philadelphia: WB Saunders",
      year: "2001",
      description: "Foundational text on parenteral nutrition principles and clinical application"
    },
    {
      title: "ESPGHAN/ESPEN/ESPR/CSPEN Guidelines on Pediatric Parenteral Nutrition",
      authors: "Koletzko B, Goulet O, Hunt J, et al.",
      journal: "Clin Nutr",
      year: "2020",
      volume: "39",
      pages: "1375-1398",
      doi: "10.1016/j.clnu.2020.02.015",
      description: "International consensus guidelines for pediatric TPN",
      url: "https://www.clinicalnutritionjournal.com/"
    },
    {
      title: "Neonatal Parenteral Nutrition: A Practical Reference Guide",
      authors: "Groh-Wargo S, Thompson M, Hovasi Cox J",
      journal: "Chicago: Precept Press",
      year: "2013",
      description: "Practical clinical reference for neonatal TPN implementation"
    },
    {
      title: "Guidelines for the Use of Parenteral and Enteral Nutrition in Adult and Pediatric Patients",
      authors: "A.S.P.E.N. Board of Directors and The Clinical Guidelines Task Force",
      journal: "JPEN J Parenter Enteral Nutr",
      year: "2002",
      volume: "26",
      pages: "1SA-138SA",
      description: "Comprehensive A.S.P.E.N. practice guidelines"
    }
  ];

  const formatCitation = (ref: Reference) => {
    let citation = '';
    if (ref.authors) citation += `${ref.authors}. `;
    citation += `${ref.title}. `;
    if (ref.journal) citation += `${ref.journal}`;
    if (ref.year) citation += `, ${ref.year}`;
    if (ref.volume) citation += `;${ref.volume}`;
    if (ref.pages) citation += `:${ref.pages}`;
    citation += '.';
    return citation;
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconBook size={20} />
          <Text size="xl" fw={600}>Clinical References & Guidelines</Text>
        </Group>
      }
      size="xl"
      centered
      styles={{
        content: { maxHeight: '80vh' },
        body: { maxHeight: 'calc(80vh - 120px)', overflowY: 'auto' }
      }}
    >
      <Stack gap="lg">
        {/* Introduction */}
        <Card p="md" style={{ backgroundColor: '#f8f9fa' }}>
          <Text size="sm" c="dimmed">
            This TPN calculation tool is based on evidence-based clinical guidelines and peer-reviewed 
            literature. The following references provide the scientific foundation for the algorithms 
            and recommendations implemented in this application.
          </Text>
        </Card>

        <Divider />

        {/* References List */}
        <Stack gap="md">
          {references.map((reference, index) => (
            <Card key={index} p="md" withBorder>
              {/* Reference Header */}
              <Group justify="space-between" align="flex-start" mb="sm">
                <Badge variant="light" size="sm">
                  {index + 1}
                </Badge>
                {reference.year && (
                  <Badge color="blue" variant="outline" size="sm">
                    {reference.year}
                  </Badge>
                )}
              </Group>

              {/* Title */}
              <Box mb="sm">
                {reference.url ? (
                  <Anchor 
                    href={reference.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <Group gap="xs" align="flex-start">
                      <Text size="md" fw={600} c="blue">
                        {reference.title}
                      </Text>
                      <IconExternalLink size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                    </Group>
                  </Anchor>
                ) : (
                  <Text size="md" fw={600}>
                    {reference.title}
                  </Text>
                )}
              </Box>

              {/* Citation Details */}
              <Box mb="sm">
                <Text size="sm" c="dark.6" style={{ lineHeight: 1.4 }}>
                  {formatCitation(reference)}
                </Text>
              </Box>

              {/* DOI */}
              {reference.doi && (
                <Box mb="sm">
                  <Text size="xs" c="dimmed">
                    DOI: <Anchor href={`https://doi.org/${reference.doi}`} target="_blank" size="xs">
                      {reference.doi}
                    </Anchor>
                  </Text>
                </Box>
              )}

              {/* Description */}
              {reference.description && (
                <Box style={{ borderLeft: '3px solid var(--mantine-color-blue-3)', paddingLeft: '12px' }}>
                  <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
                    {reference.description}
                  </Text>
                </Box>
              )}
            </Card>
          ))}
        </Stack>

        <Divider />

        {/* Footer */}
        <Card p="md" style={{ backgroundColor: '#f0f8f4' }}>
          <Stack gap="xs">
            <Text size="sm" fw={500} c="dark.8">
              Clinical Practice Notes:
            </Text>
            <Text size="xs" c="dimmed">
              • Always consult institutional policies and current clinical guidelines
            </Text>
            <Text size="xs" c="dimmed">
              • TPN recommendations should be individualized based on patient-specific factors
            </Text>
            <Text size="xs" c="dimmed">
              • Regular monitoring of lab values and clinical status is essential
            </Text>
            <Text size="xs" c="dimmed">
              • This tool is for clinical decision support and does not replace clinical judgment
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Modal>
  );
} 