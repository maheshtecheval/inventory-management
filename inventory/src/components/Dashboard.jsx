import ItemList from "./ItemList";
import ItemForm from "./ItemForm";

function Dashboard() {
  return (
    <>
      <div className="container text-center">
        <div className="row">
          <div className="col">
            {/* <ItemForm /> */}
          </div>
          <div className="col"></div>
        </div>
      </div>
      <ItemList />
    </>
  );
}

export default Dashboard;
