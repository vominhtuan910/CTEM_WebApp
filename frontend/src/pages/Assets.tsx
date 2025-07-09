import { useState, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";
import AutoScan from "../components/Assets/AutoScan.tsx";
import ManualEntryForm from "../components/Assets/ManualEntryForm.tsx";
import AssetTable from "../components/Assets/AssetTable.tsx";

const Assets: React.FC = () => {
    const [assets, setAssets] = useState<any[]>([]);
    const [scanResults, setScanResults] = useState<any[]>([]);
    const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "completed" | "failed">("idle");

    // Fetch all assets on mount
    useEffect(() => {
        fetch("/api/assets")
            .then((res) => res.json())
            .then((data) => setAssets(data))
            .catch(() => setAssets([]));
    }, []);

    // Handler to refresh assets after scan or manual add
    const refreshAssets = () => {
        fetch("/api/assets")
            .then((res) => res.json())
            .then((data) => setAssets(data));
    };

    return (
        
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Assets Management
            </Typography>
            <Paper sx={{ p: 2, mb: 3 }}>
                <AutoScan
                    scanResults={scanResults}
                    setScanResults={setScanResults}
                    scanStatus={scanStatus}
                    setScanStatus={setScanStatus}
                    onSave={refreshAssets}
                />
            </Paper>
            <Paper sx={{ p: 2, mb: 3 }}>
                <ManualEntryForm onAssetAdded={refreshAssets} onSubmit={function (_data: { name: string; value: number; }): void {
                    throw new Error("Function not implemented.");
                } } />
            </Paper>
            <Paper sx={{ p: 2 }}>
                <AssetTable assets={assets} />
            </Paper>
        </Box>
    );
};

export default Assets;