import { Typography, Box, Card } from "@mui/material";
import { Asset } from "../../../types/asset.types";
import AssetForm from "../Forms/AssetForm";
import BaseDialog from "../../common/BaseDialog";
import { sectionStyles } from "../../../utils/assets/assetStyles";

interface AssetFormDialogProps {
  open: boolean;
  type: "add" | "edit";
  asset?: Asset;
  onClose: () => void;
  onSubmit: (data: Partial<Asset>) => void;
  isSubmitting: boolean;
}

const AssetFormDialog: React.FC<AssetFormDialogProps> = ({
  open,
  type,
  asset,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const isAdd = type === "add";

  // Title for the dialog
  const dialogTitle = isAdd ? "Add New Asset" : "Edit Asset";

  // Subtitle/prelabel for the dialog
  const preLabel = !isAdd && asset ? asset.hostname : undefined;

  // Message body
  const body = isAdd
    ? "Enter the details for the new asset."
    : "Update the asset information.";

  // The form content that will be displayed in the dialog
  const formContent = isAdd ? (
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
