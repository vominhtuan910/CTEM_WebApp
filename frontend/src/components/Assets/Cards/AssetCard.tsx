import { Asset } from "../../../types/asset.types";
import AssetCardGrid from "./AssetCardGrid";
import AssetCardList from "./AssetCardList";

interface AssetCardProps {
  asset: Asset;
  viewMode: "grid" | "list";
  onDelete: (asset: Asset) => void;
}

const AssetCard: React.FC<AssetCardProps> = (props) => {
  const { viewMode } = props;

  return viewMode === "grid" ? (
    <AssetCardGrid {...props} />
  ) : (
    <AssetCardList {...props} />
  );
};

export default AssetCard;
