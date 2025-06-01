const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

/**
 * Trả về toàn bộ danh sách người dùng từ Firebase Authentication.
 */
exports.getAllUsers = functions.https.onCall(async (data, context) => {
  const allUsers = [];

  const listAllUsers = async (nextPageToken) => {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    result.users.forEach((userRecord) => {
      allUsers.push({
        uid: userRecord.uid,
        email: userRecord.email || null,
        createdAt: new Date(userRecord.metadata.creationTime).toISOString(),
      });
    });

    if (result.pageToken) {
      await listAllUsers(result.pageToken); // Tiếp tục lấy các trang tiếp theo
    }
  };

  await listAllUsers();
  return allUsers;
});

/**
 * Xoá người dùng khỏi Firebase Authentication.
 * Truyền vào: { uid: string }
 */
exports.deleteUser = functions.https.onCall(async (data, context) => {
  const { uid } = data;

  if (!uid) {
    throw new functions.https.HttpsError("invalid-argument", "Thiếu uid.");
  }

  try {
    await admin.auth().deleteUser(uid);
    return { success: true, message: `Đã xoá user ${uid}` };
  } catch (error) {
    console.error("❌ Lỗi xoá user:", error);
    throw new functions.https.HttpsError("unknown", "Không xoá được người dùng.");
  }
});
