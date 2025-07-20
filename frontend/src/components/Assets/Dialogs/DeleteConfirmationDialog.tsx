import { Asset } from "../../../types/asset.types";
import BaseDialog from "../../common/BaseDialog";
import { Typography, Box } from "@mui/material";

interface DeleteConfirmationDialogProps {
  open: boolean;
  asset: Asset | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  asset,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!asset) return null;

  // Create the dialog body with bold hostname
  const bodyContent = (
    <>
      Are you sure you want to delete{" "}
      <Typography component="span" fontWeight="bold" color="error">
        {asset.hostname}
      </Typography>
      ?
    </>
  );

  return (
    <BaseDialog
      isOpen={open}
      title="Delete Asset"
      body={bodyContent}
      impactPoints={[
        "All associated data will be permanently deleted",
        "This action cannot be reversed",
      ]}
      primaryLabel={isDeleting ? "Deleting..." : "Delete"}
      secondaryLabel="Cancel"
      onPrimary={onConfirm}
      onCancel={onClose}
      mode="destructive"
      preLabel="Warning"
      closeOnBackdropClick={!isDeleting}
      closeOnEsc={!isDeleting}
    />
  );
};

export default DeleteConfirmationDialog;
