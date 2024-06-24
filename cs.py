import socket, sys

def introducer():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.bind(('0.0.0.0', 5000))
        print("Introducer listening on port 5000")

        peers = []

        while True:
            data, addr = sock.recvfrom(1024)
            print(f"Received connection from {addr}")

            if addr not in peers:
                peers.append(addr)

            if len(peers) == 2:
                print("Informing peers about each other")
                sock.sendto(f"{peers[1][0]}:{peers[1][1]}".encode(), peers[0])
                sock.sendto(f"{peers[0][0]}:{peers[0][1]}".encode(), peers[1])
                peers.clear()
    except KeyboardInterrupt:
        sys.exit(0)
    finally:
        print("SHUTDOWN...")
        sock.close()

if __name__ == "__main__":
    introducer()