from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import torch
import io
import function.rotate as utils_rotate
import function.helper as helper
import uvicorn


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

yolo_LP_detect = torch.hub.load(r"F:/Deep_learning/DL-NangCao/yolov5", 'custom', path=r'F:/Deep_learning/DL-NangCao/nmai/model/LP_detector.pt', force_reload=True, source=r'local', verbose=False)
yolo_license_plate = torch.hub.load(r"F:/Deep_learning/DL-NangCao/yolov5", 'custom', path=r'F:/Deep_learning/DL-NangCao/nmai/model/best.pt', force_reload=True, source=r'local', verbose=False)
yolo_license_plate.conf = 0.60

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    image_bytes = await file.read()
    img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        return {"error": "Cannot decode image"}, 400

    plates = yolo_LP_detect(img, size=640)
    list_plates = plates.pandas().xyxy[0].values.tolist()
    list_read_plates = set()

    if len(list_plates) == 0:
        lp = helper.read_plate(yolo_license_plate, img)
        if lp != "unknown":
            list_read_plates.add(lp)
    else:
        for plate in list_plates:
            flag = 0
            x = int(plate[0])
            y = int(plate[1])
            w = int(plate[2] - plate[0])
            h = int(plate[3] - plate[1])
            crop_img = img[y:y+h, x:x+w]
            for cc in range(0, 2):
                for ct in range(0, 2):
                    lp = helper.read_plate(yolo_license_plate, utils_rotate.deskew(crop_img, cc, ct))
                    if lp != "unknown":
                        list_read_plates.add(lp)
                        flag = 1
                        break
                if flag == 1:
                    break

    license_plates = list(list_read_plates) if list_read_plates else ["unknown"]

    plates.render()  
    img_with_boxes = plates.ims[0]
    _, img_encoded = cv2.imencode('.jpg', img_with_boxes)
    img_bytes = io.BytesIO(img_encoded.tobytes())
    return {
        "results": {
            "filename": file.filename,
            "license_plates": license_plates
        },
        "image_with_boxes": img_bytes.getvalue().hex()  
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=True 
    )