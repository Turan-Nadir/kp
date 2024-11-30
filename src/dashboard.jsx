import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Dashboard = () => {
  const token = localStorage.getItem("token");
  const id = localStorage.getItem("user");
  const parsed = JSON.parse(id);
  const navigate = useNavigate();

  const [taskName, setTaskName] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState("");
  const [finish, setFinish] = useState("");
  const [color, setColor] = useState("#000000");
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // Task being modified
  const [showModal, setShowModal] = useState(false);
// Format the date to display hours and minutes
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("https://skanban.glasscube.io/dashboard/all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: JSON.parse(token) }),
        });
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks || []);
        } else {
          console.error("Failed to fetch tasks");
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (taskName.trim()) {
      try {
        const response = await fetch("https://skanban.glasscube.io/dashboard/task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: taskName,
            desc,
            start,
            finish,
            color,
            status: 3, // Planned
            token: JSON.parse(token),
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setTasks((prevTasks) => [...prevTasks, data.task]);
          setTaskName("");
          setDesc("");
          setStart("");
          setFinish("");
          setColor("#000000");
          setModalOpen(false);
        } else {
          console.error("Failed to add task");
        }
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };
  // Open the modal for modifying a task
  const openModifyModal = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };
  // Handle task modification
  const handleModify = async () => {
    try {
      const response = await fetch(`https://skanban.glasscube.io/dashboard/modify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({selectedTask,token:JSON.parse(token)}),
      });
      if (response.ok) {
        try {
          const response = await fetch("https://skanban.glasscube.io/dashboard/all", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: JSON.parse(token) }),
          });
          if (response.ok) {
            const data = await response.json();
            setTasks(data.tasks || []);
          } else {
            console.error("Failed to fetch tasks");
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
        setShowModal(false);
      } else {
        console.error("Failed to modify task");
      }
    } catch (error) {
      console.error("Error modifying task:", error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      console.log(taskId);
      const response = await fetch("https://skanban.glasscube.io/dashboard/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, token: JSON.parse(token) }),
      });
      if (response.ok) {
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      } else {
        console.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
  
    // If dropped outside any list
    if (!destination) return;
  
    // If dropped in the same list and position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
  
    // Find the dragged task
    const draggedTask = tasks.find((task) => task._id === draggableId);
  
    // If the task is not found, log and exit
    if (!draggedTask) {
      console.error("Task not found for draggableId:", draggableId);
      return;
    }
  
    // Update the task status based on destination droppableId
    const updatedTask = { ...draggedTask, status: parseInt(destination.droppableId) };
  
    // Update the state with the new task list
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task._id === draggableId ? updatedTask : task))
    );
  
    // Optionally, send the update to the backend
    try {
      fetch("https://skanban.glasscube.io/dashboard/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: draggableId,
          status: parseInt(destination.droppableId),
          token: JSON.parse(localStorage.getItem("token")),
        }),
      }).then((response) => {
        if (!response.ok) {
          console.error("Failed to update task status on the server");
        }
      });
    } catch (error) {
      console.error("Error updating task status on the server:", error);
    }
  };
  

  const filteredTasks = {
    planned: tasks.filter((task) => task?.status === 3),
    ongoing: tasks.filter((task) => task?.status === 2),
    finished: tasks.filter((task) => task?.status === 1),
};

  const TaskCard = ({ task }) => (
    <div
    className="p-6 m-3 max-w-11/12 min-w-10/12 bg-white border rounded-lg shadow-md transition-all duration-300 hover:shadow-xl relative"
    style={{ borderLeft: `5px solid ${task.color}`, maxWidth: '500px' }} // Set a max width for the card
  >
    <h3 className="font-bold text-lg">{task.task}</h3>
    <div className="text-sm text-gray-500 mb-2">
      <p>Start: {formatDate(task.start)}</p>
      <p>Finish: {formatDate(task.finish)}</p>
    </div>
  
    {/* Description that shows partially */}
    <div className="overflow-hidden w-40 transition-all duration-300 h-12 hover:h-auto hover:w-auto ease-in-out">
      <p className="p-4 bg-gray-100 rounded-lg shadow-sm">{task.desc}</p>
    </div>
  
    {/* Buttons */}
    <div className="flex justify-between mt-4">
      <button
        onClick={() => handleDelete(task._id)}
        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
      >
        Delete
      </button>
      <button
        onClick={() => openModifyModal(task)}
        className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
      >
        Modify
      </button>
    </div>
  </div>
  
  );

  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-5">
      <div className="flex flex-row w-full h-fit p-1 border rounded-lg border-blue-800 items-baseline">
        <h2 className="text-blue-700 text-lg m-5">Task Flow</h2>
        <p className="m-5 text-gray-900">User signed in as: @{parsed} </p>
        <button
          className="w-20 h-10 bg-green-500 text-white rounded-lg"
          onClick={() => setModalOpen(true)}
        >
          Add Task
        </button>
        <button
          className="h-fit w-fit p-2 m-3 border-2 rounded-lg border-blue-600"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/");
          }}
        >
          Log Out
        </button>
      </div>

      <div className="flex flex-row h-full w-full mt-5">
        <DragDropContext onDragEnd={onDragEnd}>
          {["planned", "ongoing", "finished"].map((status, index) => (
            <Droppable
              droppableId={index === 0 ? "3" : index === 1 ? "2" : "1"}
              key={status}
            >
              {(provided) => (
                <div
                  className={`flex flex-col mx-3 items-center h-full w-4/12 border-2 ${
                    status === "planned"
                      ? "border-green-600"
                      : status === "ongoing"
                      ? "border-red-500"
                      : "border-gray-700"
                  } rounded-lg`}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <h2 className="text-xl capitalize">{status} List</h2>
                  {filteredTasks[status].map((task, idx) => (
  <Draggable key={task._id} draggableId={task._id} index={idx}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <TaskCard task={task} />
      </div>
    )}
  </Draggable>
))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>

      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Add Task</h3>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Task Name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="p-2 border rounded-md"
              />
              <textarea
                placeholder="Description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="p-2 border rounded-md"
              ></textarea>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="p-2 border rounded-md"
              />
              <input
                type="datetime-local"
                value={finish}
                onChange={(e) => setFinish(e.target.value)}
                className="p-2 border rounded-md"
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="p-2 border rounded-md"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{showModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">Modify Task</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Task Name</label>
                <input
                  type="text"
                  name="task"
                  value={selectedTask.task}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      task: e.target.value,
                    })
                  }
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="desc"
                  value={selectedTask.desc}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      desc: e.target.value,
                    })
                  }
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Start Date</label>
                <input
                  type="datetime-local"
                  name="start"
                  value={new Date(selectedTask.start).toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      start: new Date(e.target.value).toISOString(),
                    })
                  }
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Finish Date</label>
                <input
                  type="datetime-local"
                  name="finish"
                  value={new Date(
                    selectedTask.finish
                  ).toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      finish: new Date(e.target.value).toISOString(),
                    })
                  }
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Color</label>
                <input
                  type="color"
                  name="color"
                  value={selectedTask.color}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      color: e.target.value,
                    })
                  }
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleModify}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
