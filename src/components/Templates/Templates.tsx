import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
} from '@mui/material';
import React from 'react';
import { networkTemplates, createDiagramFromTemplate } from '../../data/templates';
import { useDiagramStore } from '../../store/diagramStore';

interface TemplatesProps {
  open: boolean;
  onClose: () => void;
}

const Templates: React.FC<TemplatesProps> = ({ open, onClose }) => {
  const { loadDiagram } = useDiagramStore();

  const handleLoadTemplate = (templateId: string) => {
    const template = networkTemplates.find(t => t.id === templateId);
    if (template) {
      const diagram = createDiagramFromTemplate(template);
      loadDiagram(diagram);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Network Templates</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {networkTemplates.map((template) => (
            <Grid size={{ xs: 12, sm: 6 }} key={template.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {template.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${template.devices.length} devices`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${template.connections.length} connections`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => handleLoadTemplate(template.id)}
                  >
                    Use Template
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Templates;