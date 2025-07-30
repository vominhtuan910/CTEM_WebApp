from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from gvm.connections import UnixSocketConnection
from gvm.protocols.gmp import Gmp
from gvm.errors import GvmError

GVMD_SOCKET = "/var/run/gvmd.sock"
GVM_USERNAME = "admin"
GVM_PASSWORD = "your-password"
SCAN_CONFIG_ID = "daba56c8-73ec-11df-a475-002264764cea"  # Full and fast

app = FastAPI()

def connect_gmp():
    conn = UnixSocketConnection(path=GVMD_SOCKET)
    gmp = Gmp(conn)
    gmp.authenticate(GVM_USERNAME, GVM_PASSWORD)
    return gmp

class ScanRequest(BaseModel):
    ip: str

@app.post("/scan")
def scan_ip(req: ScanRequest):
    try:
        gmp = connect_gmp()
        target = gmp.create_target(name=f"target-{req.ip}", hosts=[req.ip])
        target_id = target.get("id")

        task = gmp.create_task(name=f"scan-{req.ip}", config_id=SCAN_CONFIG_ID, target_id=target_id)
        task_id = task.get("id")

        gmp.start_task(task_id)
        return {"task_id": task_id}
    except GvmError as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/{task_id}")
def get_status(task_id: str):
    try:
        gmp = connect_gmp()
        task = gmp.get_task(task_id=task_id)
        status = task.find(".//status").text
        progress = task.find(".//progress").text
        return {"status": status, "progress": progress}
    except GvmError as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/report/{task_id}")
def get_report(task_id: str):
    try:
        gmp = connect_gmp()
        task = gmp.get_task(task_id=task_id)
        status = task.find(".//status").text

        if status != "Done":
            return {"status": status, "report": None}

        report_id = task.find(".//last_report/report").get("id")
        report = gmp.get_report(report_id=report_id, details=True)

        results = []
        for result in report.findall(".//result"):
            desc = result.find("description")
            if desc is not None and desc.text:
                results.append(desc.text)

        return {
            "status": "Done",
            "report_id": report_id,
            "results": results,
        }

    except GvmError as e:
        raise HTTPException(status_code=500, detail=str(e))
