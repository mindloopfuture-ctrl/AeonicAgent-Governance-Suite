from flask import Flask, request, jsonify
from hashlib import sha256
import os, json, time

app = Flask(__name__)
MEM_FILE = "ethos_memory.json"

if not os.path.exists(MEM_FILE):
    json.dump([], open(MEM_FILE, "w"))

def load_mem():
    return json.load(open(MEM_FILE))

def save_mem(data):
    json.dump(data, open(MEM_FILE, "w"), indent=2)

@app.route("/")
def index():
    return open("index.html").read()

@app.route("/api/ethos", methods=["POST"])
def ethos():
    data = request.get_json(force=True)
    msg = data.get("input","").strip()
    if not msg:
        return jsonify({"error":"input vacío"}),400

    # Análisis ético simple (modo local)
    forbidden = ["dañar","matar","virus","explosivo","odio"]
    if any(w in msg.lower() for w in forbidden):
        res = {"estado":"rechazado","razón":"Violación PoES — acción dañina."}
    else:
        digest = sha256((msg+str(time.time())).encode()).hexdigest()
        mem = load_mem(); mem.append({"msg":msg,"hash":digest,"ts":time.time()}); save_mem(mem)
        res = {"estado":"aceptado","respuesta":f"Decisión ética registrada.", "hash":digest}

    return jsonify(res)

@app.route("/api/memoria")
def memoria():
    return jsonify(load_mem())

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
