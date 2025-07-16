import { Asset } from "../../../types/asset.types";
import BaseDialog from "../../common/BaseDialog";

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

  return (
    <BaseDialog
      isOpen={open}
      title="Delete Asset"
      body={`Are you sure you want to delete ${asset.hostname}? This action cannot be undone.`}
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
