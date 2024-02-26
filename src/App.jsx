import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { useEffect, useState } from "react";
import DropComponent from "./DropComponent";

export default function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // localhost:8000/users
    fetch("http://localhost:8000/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      });
  }, []);

  const handleDragEnd = (e) => {
    if (!e.destination) return;
    let tempData = [...users];
    let [source_data] = tempData.splice(e.source.index, 1);
    tempData.splice(e.destination.index, 0, source_data);
    // here we will track the all rows whose order has been changed

    const minIndex = Math.min(e.source.index, e.destination.index);
    const maxIndex = Math.max(e.source.index, e.destination.index);

    // we will create a new array of objects with the updated order

    let tempArr = [];

    for (let i = minIndex; i <= maxIndex; i++) {
      // state order is not changing here
      tempArr.push({
        id: tempData[i].id,
        order: users[i].order,
        name: tempData[i].name,
      });

      // we will update the order of the rows in the state
      tempData[i] = {
        ...tempData[i],
        order: users[i].order,
      };

      // so both the place we are using state data to update the order on updated rows
      // means on drag-end we are chaning the object order of the array
      // so the order of the objects/rows will be updated
      // and the loop will go from minIndex to maxIndex
      // so the order of the rows will be updated in the state and in the tempArr
      // tempArr will be used to update the order of the rows in the database
    }

    console.log(tempArr, tempData);

    // now we can call the api to update the order of the rows

    updateRowIdToDB(tempArr);

    setUsers(tempData);
  };

  const updateRowIdToDB = (tempArr) => {
    fetch("http://localhost:8000/users/order", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tempArr),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  };

  const sortedUsers = users.sort((a, b) => a.order - b.order);

  return (
    <div className="p-8 mt-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th />
              <th>Username</th>
              <th>Age</th>
              <th>Gender</th>
            </tr>
          </thead>
          <DropComponent droppableId="droppable-1">
            {(provider) => (
              <tbody
                className="capitalize"
                ref={provider.innerRef}
                {...provider.droppableProps}
              >
                {sortedUsers?.map((user, index) => (
                  <Draggable
                    key={user.name}
                    draggableId={user.name}
                    index={index}
                  >
                    {(provider) => (
                      <tr {...provider.draggableProps} ref={provider.innerRef}>
                        <td {...provider.dragHandleProps}> = </td>
                        <td>{user.name}</td>
                        <td>{user.age}</td>
                        <td>{user.gender}</td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provider.placeholder}
              </tbody>
            )}
          </DropComponent>
        </table>
      </DragDropContext>
    </div>
  );
}
