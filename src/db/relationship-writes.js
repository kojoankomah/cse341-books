let pendingWrite = Promise.resolve();

const runRelationshipWrite = async (write) => {
  const previousWrite = pendingWrite;
  let releaseWrite;

  pendingWrite = new Promise((resolve) => {
    releaseWrite = resolve;
  });

  try {
    await previousWrite;
    const result = await write();
    return result;
  } finally {
    releaseWrite();
  }
};

export { runRelationshipWrite };