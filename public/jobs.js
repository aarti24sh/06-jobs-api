import {
    inputEnabled,
    setDiv,
    message,
    setToken,
    token,
    enableInput,
  } from "./index.js";
  import { showLoginRegister } from "./loginRegister.js";
  import { showAddEdit } from "./addEdit.js";
  
  let jobsDiv = null;
  let jobsTable = null;
  let jobsTableHeader = null;
  
  export const handleJobs = () => {
    jobsDiv = document.getElementById("jobs");
    const logoff = document.getElementById("logoff");
    const addJob = document.getElementById("add-job");
    jobsTable = document.getElementById("jobs-table");
    jobsTableHeader = document.getElementById("jobs-table-header");
  
    jobsDiv.addEventListener("click", async (e) => {
      if (inputEnabled && e.target.nodeName === "BUTTON") {
        if (e.target === addJob) {
          showAddEdit(null);
        } else if (e.target.classList.contains("editButton")) {
          message.textContent = "";
          showAddEdit(e.target.dataset.id);
        } else if (e.target.classList.contains("deleteButton")) {
          const jobId = e.target.dataset.id;
          if (!confirm("Are you sure you want to delete this job?")) return;
    
          enableInput(false);
          try {
            const response = await fetch(`/api/v1/jobs/${jobId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
    
            const data = await response.json();
            if (response.status === 200) {
              message.textContent = "The job was deleted.";
              showJobs(); // refresh the list
            } else {
              message.textContent = data.msg || "Delete failed.";
            }
          } catch (err) {
            console.log(err);
            message.textContent = "A communication error occurred.";
          }
          enableInput(true);
        } else if (e.target === logoff) {
          setToken(null);

          message.textContent = "You have been logged off.";

          jobsTable.replaceChildren([jobsTableHeader]);

          showLoginRegister();
        }
      }
    });
  };
  
  export const showJobs = async () => {
    try {
      enableInput(false);
  
      const response = await fetch("/api/v1/jobs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      let children = [jobsTableHeader];
  
      if (response.status === 200) {
        if (data.count === 0) {
          jobsTable.replaceChildren(...children); // clear this for safety
        } else {
          for (let i = 0; i < data.jobs.length; i++) {
            let rowEntry = document.createElement("tr");
  
            let editButton = `<td><button type="button" class="editButton" data-id=${data.jobs[i]._id}>edit</button></td>`;
            let deleteButton = `<td><button type="button" class="deleteButton" data-id=${data.jobs[i]._id}>delete</button></td>`;
            let rowHTML = `
              <td>${data.jobs[i].company}</td>
              <td>${data.jobs[i].position}</td>
              <td>${data.jobs[i].status}</td>
              <div>${editButton}${deleteButton}</div>`;
  
            rowEntry.innerHTML = rowHTML;
            children.push(rowEntry);
          }
          jobsTable.replaceChildren(...children);
        }
      } else {
        message.textContent = data.msg;
      }
    } catch (err) {
      console.log(err);
      message.textContent = "A communication error occurred.";
    }
    enableInput(true);
    setDiv(jobsDiv);
  };