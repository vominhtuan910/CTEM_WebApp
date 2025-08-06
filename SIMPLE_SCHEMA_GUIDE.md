# Simple Database Schema Guide

This project now uses a simplified database schema that focuses on core functionality without complex fields.

## 📊 **Database Schema**

### **Asset Table**

```sql
CREATE TABLE assets (
    id          SERIAL PRIMARY KEY,
    ip          VARCHAR UNIQUE NOT NULL,
    hostname    VARCHAR,
    os          VARCHAR,
    created_at  TIMESTAMP DEFAULT NOW()
);
```

### **NmapScan Table**

```sql
CREATE TABLE nmap_scans (
    id          SERIAL PRIMARY KEY,
    asset_id    INTEGER REFERENCES assets(id),
    scan_date   TIMESTAMP DEFAULT NOW(),
    ports       JSON,
    os          VARCHAR
);
```

### **OpenVasScan Table**

```sql
CREATE TABLE openvas_scans (
    id          SERIAL PRIMARY KEY,
    asset_id    INTEGER REFERENCES assets(id),
    scan_date   TIMESTAMP DEFAULT NOW(),
    report_xml  TEXT
);
```

### **Finding Table**

```sql
CREATE TABLE findings (
    id                SERIAL PRIMARY KEY,
    openvas_scan_id   INTEGER REFERENCES openvas_scans(id),
    cve_id           VARCHAR,
    title            VARCHAR,
    severity         VARCHAR,
    cvss_score       FLOAT,
    status           VARCHAR DEFAULT 'NOT_VALIDATED',
    exploit_command  VARCHAR
);
```

## 🔧 **API Endpoints**

### **Assets API**

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| GET    | `/api/assets`      | Get all assets     |
| GET    | `/api/assets/{id}` | Get specific asset |
| POST   | `/api/assets`      | Create new asset   |
| PUT    | `/api/assets/{id}` | Update asset       |
| DELETE | `/api/assets/{id}` | Delete asset       |

### **Request Format**

**Create Asset:**

```json
{
  "hostname": "server-01",
  "ipAddress": "192.168.1.10",
  "os": {
    "name": "Ubuntu",
    "version": "22.04"
  }
}
```

**Update Asset:**

```json
{
  "hostname": "server-01-updated",
  "os": {
    "name": "CentOS"
  }
}
```

### **Response Format**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "hostname": "server-01",
    "ip_address": "192.168.1.10",
    "ip_addresses": ["192.168.1.10"],
    "status": "active",
    "os_name": "Ubuntu",
    "os_version": "",
    "os_architecture": "",
    "os_build_number": "",
    "os_last_boot_time": "",
    "created_at": "2025-08-06T15:00:00Z",
    "updated_at": "2025-08-06T15:00:00Z",
    "services": [],
    "applications": [],
    "labels": [],
    "health_score": null,
    "issues_count": 0,
    "agent_status": "not_installed",
    "confidentiality": 1,
    "integrity": 1,
    "availability": 1,
    "department": null,
    "location": null,
    "owner": null,
    "last_scan": null,
    "total_findings": 0,
    "critical_findings": 0,
    "high_findings": 0
  }
}
```

## 🎯 **Key Features**

### **What's Included:**

- ✅ Basic asset management (hostname, IP, OS)
- ✅ Scan relationships (Nmap, OpenVAS)
- ✅ Vulnerability findings
- ✅ Full CRUD operations
- ✅ Frontend compatibility

### **What's Simplified:**

- 🔄 **Status**: Always returns "active" (not stored in DB)
- 🔄 **Health Score**: Always returns null (calculated on demand)
- 🔄 **Labels**: Always returns empty array (not stored in DB)
- 🔄 **Priority Scores**: Always returns default values (1,1,1)
- 🔄 **Metadata**: Department, location, owner always null
- 🔄 **OS Details**: Only name stored, version/arch returned as empty

## 🚀 **Benefits of Simple Schema**

1. **Faster Development**: Less complex relationships and fields
2. **Easier Maintenance**: Fewer columns to manage
3. **Better Performance**: Smaller table size and simpler queries
4. **Cleaner Code**: Less conditional logic for optional fields
5. **Frontend Compatible**: Still provides all fields frontend expects

## 🧪 **Testing**

Run the test script to verify everything works:

```bash
cd backend
python test_api.py
```

Expected output:

```
🧪 Testing Assets API Connectivity
==================================================
✅ Health check: 200
✅ GET /assets: 200
   Found 0 assets

🔄 Testing CRUD Operations
------------------------------
✅ POST /assets: 200
   Created asset with ID: 1
✅ GET /assets/1: 200
   Asset hostname: test-server
✅ PUT /assets/1: 200
   Asset updated successfully
✅ DELETE /assets/1: 200
   Asset deleted successfully

✅ All tests completed!
```

## 📝 **Migration Applied**

The database has been migrated from the complex schema to this simple one:

- **Removed**: 15+ extra columns (status, health_score, labels, etc.)
- **Kept**: Core fields (id, ip, hostname, os, created_at)
- **Maintained**: All relationships with scan tables

The frontend will continue to work normally as the API still returns all expected fields with appropriate default values.

## 🎯 **Summary**

This simplified schema provides:

- ✅ **Core functionality** for asset management
- ✅ **Full API compatibility** with the frontend
- ✅ **Scan integration** with Nmap and OpenVAS
- ✅ **Vulnerability tracking** through findings
- ✅ **Clean, maintainable code** structure

Perfect for a focused CTEM (Continuous Threat Exposure Management) application! 🚀
