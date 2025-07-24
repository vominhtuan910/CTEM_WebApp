import { useState } from "react";
import { Typography, Box, Card, Tabs, Tab } from "@mui/material";
import { Asset } from "../../../types/asset.types";
import AssetForm from "../Forms/AssetForm";
import BaseDialog from "../../common/BaseDialog";
import { sectionStyles } from "../../../utils/assets/assetStyles";
import ImportSection from "./ImportSection";

interface AssetFormDialogProps {
  open: boolean;
  type: "add" | "edit";
  asset?: Asset;
  onClose: () => void;
  onSubmit: (data: Partial<Asset>) => void;
  isSubmitting: boolean;
  importMode?: boolean;
  importFile?: File | null;
  onImportFile?: (file: File) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`asset-tabpanel-${index}`}
      aria-labelledby={`asset-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const AssetFormDialog: React.FC<AssetFormDialogProps> = ({
  open,
  type,
  asset,
  onClose,
  onSubmit,
  isSubmitting,
  importMode = false,
  importFile = null,
  onImportFile,
}) => {
  const isAdd = type === "add";
  const [tabValue, setTabValue] = useState<number>(importMode ? 1 : 0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Title for the dialog
  const dialogTitle = isAdd ? "Add New Asset" : "Edit Asset";

  // Subtitle/prelabel for the dialog
  const preLabel = !isAdd && asset ? asset.hostname : undefined;

  // Message body based on tab
  const body =
    tabValue === 0
      ? isAdd
        ? "Enter the details for the new asset."
        : "Update the asset information."
      : "Import assets from a file or scan results.";

  // The form content that will be displayed in the dialog
  const formContent = (
    <>
      {isAdd && (
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
        >
          <Tab label="Manual Entry" />
          <Tab label="Import" />
        </Tabs>
      )}

      <TabPanel value={tabValue} index={0}>
        {isAdd ? (
          <AssetForm
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        ) : (
          asset && (
            <Card sx={sectionStyles.card}>
              <Typography variant="subtitle1" sx={sectionStyles.title}>
                Basic Information
              </Typography>
              <Box sx={sectionStyles.content}>
                <AssetForm
                  asset={asset}
                  onSubmit={onSubmit}
                  onCancel={onClose}
                  isSubmitting={isSubmitting}
                />
              </Box>
            </Card>
          )
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ImportSection
          onImportFile={onImportFile}
          importFile={importFile}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </TabPanel>
    </>
  );

  // Create dummy onPrimary and onCancel handlers since we're using custom form buttons
  const handlePrimary = () => {
    // This is handled by the form's submit button
  };

  return (
    <BaseDialog
      isOpen={open}
      title={dialogTitle}
      body={body}
      preLabel={preLabel}
      primaryLabel="Save"
      secondaryLabel="Cancel"
      onPrimary={handlePrimary}
      onCancel={() => !isSubmitting && onClose()}
      closeOnBackdropClick={!isSubmitting}
      closeOnEsc={!isSubmitting}
    >
      {formContent}
    </BaseDialog>
  );
};

export default AssetFormDialog;
