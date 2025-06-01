import { useState, useEffect } from "react";
import {
    uploadImage,
    insertTask1Question,
    insertTask2Question,
    updateTask1Fields,
    updateTask2Fields
} from "./supabaseClient";

export default function PracPage({ taskType: initialTaskType = "task1", mode = "add", editTest = null, onClose, onSuccess }) {
    // State for add
    const [taskType, setTaskType] = useState(initialTaskType);
    const [newFile, setNewFile] = useState(null);
    const [newIssue, setNewIssue] = useState("");
    const [newDescriptionTitle, setNewDescriptionTitle] = useState("");

    // State for edit
    const [editFile, setEditFile] = useState(null);
    const [editIssue, setEditIssue] = useState("");
    const [editDescriptionTitle, setEditDescriptionTitle] = useState("");

    // When entering edit mode, pre-fill fields
    useEffect(() => {
        if (mode === "edit" && editTest) {
            setEditIssue(editTest.issue || "");
            setEditDescriptionTitle(editTest.description_title || "");
            setEditFile(null);
        }
    }, [mode, editTest]);

    async function handleInsert() {
        let imageUrl = null;
        try {
            if (taskType === "task1" && newFile) {
                const urlObj = await uploadImage(newFile, newFile.name);
                imageUrl = urlObj.data?.publicUrl || urlObj.publicUrl || urlObj;
            }
            if (taskType === "task1") {
                await insertTask1Question({
                    title: "IELTS Task 1",
                    image_url: imageUrl,
                    issue: newIssue,
                    description_title: newDescriptionTitle
                });
            } else if (taskType === "task2") {
                await insertTask2Question({
                    title: "IELTS Task 2",
                    issue: newIssue,
                    description_title: newDescriptionTitle
                    // KHÔNG truyền image_url ở đây!
                });
            }
            alert("Inserted!");
            setNewFile(null);
            setNewIssue("");
            setNewDescriptionTitle("");
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Insert error:", err);
            alert("Insert error: " + (err.message || JSON.stringify(err)));
        }
    }

    async function handleUpdate() {
        let imageUrl = editTest.image_url;
        try {
            if (editTest.taskType === "task1" && editFile) {
                const urlObj = await uploadImage(editFile, editFile.name);
                imageUrl = urlObj.data?.publicUrl || urlObj.publicUrl || urlObj;
            }
            if (editTest.taskType === "task1") {
                await updateTask1Fields(editTest.id, {
                    image_url: imageUrl,
                    issue: editIssue,
                    description_title: editDescriptionTitle
                });
            } else if (editTest.taskType === "task2") {
                await updateTask2Fields(editTest.id, {
                    issue: editIssue,
                    description_title: editDescriptionTitle
                });
            }
            alert("Updated!");
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Update error:", err);
            alert("Update error: " + (err.message || JSON.stringify(err)));
        }
    }

    if (mode === "edit" && editTest) {
        // Edit mode UI
        return (
            <div>
                <h2>Edit Question (ID: {editTest.id})</h2>
                {editTest.taskType === "task1" && (
                    <div>
                        <input
                            type="file"
                            onChange={(e) => setEditFile(e.target.files[0])}
                        />
                    </div>
                )}
                <div>
                    <label>
                        Issue:
                        <input
                            type="text"
                            value={editIssue}
                            onChange={e => setEditIssue(e.target.value)}
                            style={{ width: 300, marginLeft: 8 }}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Description Title:
                        <input
                            type="text"
                            value={editDescriptionTitle}
                            onChange={e => setEditDescriptionTitle(e.target.value)}
                            style={{ width: 300, marginLeft: 8 }}
                        />
                    </label>
                </div>
                <button onClick={handleUpdate} style={{ marginRight: 12 }}>Update</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        );
    }

    // Add mode UI
    return (
        <div>
            <h2>Add New Question</h2>
            <div style={{ marginBottom: 16 }}>
                <label>
                    Task Type:&nbsp;
                    <select
                        value={taskType}
                        onChange={e => setTaskType(e.target.value)}
                        style={{ padding: "4px 12px", borderRadius: 6, fontSize: 15 }}
                    >
                        <option value="task1">Task 1</option>
                        <option value="task2">Task 2</option>
                    </select>
                </label>
            </div>
            {taskType === "task1" && (
                <div>
                    <input
                        type="file"
                        onChange={(e) => setNewFile(e.target.files[0])}
                    />
                </div>
            )}
            <div>
                <label>
                    Issue:
                    <input
                        type="text"
                        value={newIssue}
                        onChange={e => setNewIssue(e.target.value)}
                        style={{ width: 300, marginLeft: 8 }}
                    />
                </label>
            </div>
            <div>
                <label>
                    Description Title:
                    <input
                        type="text"
                        value={newDescriptionTitle}
                        onChange={e => setNewDescriptionTitle(e.target.value)}
                        style={{ width: 300, marginLeft: 8 }}
                    />
                </label>
            </div>
            <button onClick={handleInsert}>Upload & Insert</button>
        </div>
    );
}
