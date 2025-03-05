
export async function  getClassData() {
  return {
    classes: {
        red: { color: [255, 0, 0, 127], id: 1 },
        green: { color: [0, 255, 0, 127], id: 2 },
        blue: { color: [0, 0, 255, 127], id: 3 },
        background: { color: [0, 0, 0, 0], id: 0 },
    }
  };
}
