class UserFormComponent extends HTMLElement
{
    constructor()
    {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback()
    {
        this.render();
        this.loadUsers();
    }

    render()
    {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: Arial, sans-serif;
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                }

                /* Centering the form */
                #userForm {
                    max-width: 400px;
                    margin: 50px auto;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    display: flex;
                    flex-direction: column;
                }

                .form-group {
                    margin-bottom: 15px;
                }

                input[type="text"],
                input[type="email"],
                input[type="number"] {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    font-size: 14px;
                    box-sizing: border-box;
                    transition: border-color 0.3s ease-in-out;          
                }

                button {
                    width: 100%;
                    padding: 10px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 16px;
                    cursor: pointer;
                }

                button:hover {
                    background-color: #45a049;
                }

                #deleteButton {
                    background-color: red;
                }

                #deleteButton:hover {
                    background-color: darkred;
                }

                .user-list {
                    margin-top: 20px;
                    border-radius: 4px;
                    padding: 10px;
                }

                .user-item {
                    margin-bottom: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);   
                    padding: 10px;
                    border-radius: 4px;
                }

                .error-message {
                    color: red;
                    font-size: 13px;
                    display: none;
                    margin-top: 5px;
                }

                .error {
                    border-color: red;
                }
            </style>
            <form id="userForm">
                <div class="form-group">
                    <input type="text" name="name" placeholder="Full Name" required>
                    <span class="error-message" id="nameError"></span>
                </div>
                <div class="form-group">
                    <input type="email" name="email" placeholder="Email" required>
                    <span class="error-message" id="emailError"></span>
                </div>
                <div class="form-group">
                    <input type="number" name="age" placeholder="Age" required>
                    <span class="error-message" id="ageError"></span>
                </div>
                <button type="submit">Add User</button>
            </form>
            <div class="user-list" id="userList"></div>
        `;

        this.shadowRoot.getElementById('userForm').addEventListener('submit', this.handleSubmit.bind(this));
    }

    handleSubmit(event)
    {
        event.preventDefault();

        const form = event.target;
        const name = form.name.value;
        const email = form.email.value;
        const age = form.age.value;

        let isValid = true;

        // Clear previous error messages
        this.clearErrors();

        // Validate Name
        if (name === '' || name.trim() === '' || name.length < 3)
        {
            this.showError('nameError', 'Full Name is required.');
            form.name.classList.add('error');
            isValid = false;
        }

        // Validate Email
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!email || !emailRegex.test(email))
        {
            this.showError('emailError', 'Please enter a valid email address.');
            form.email.classList.add('error');
            isValid = false;
        }

        // Validate Age
        if (!age || age <= 0 || isNaN(age) || age > 120 || age % 1 !== 0 || age.toString().length > 3)
        {
            this.showError('ageError', 'Please enter a valid age.');
            form.age.classList.add('error');
            isValid = false;
        }

        // If valid, save user data
        if (isValid)
        {
            const user = {
                id: Date.now().toString(),
                name,
                email,
                age: parseInt(age)
            };

            this.saveUser(user);
            this.loadUsers();
            form.reset();
        }
    }

    showError(elementId, message)
    {
        const errorElement = this.shadowRoot.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    clearErrors()
    {
        this.shadowRoot.querySelectorAll('.error-message').forEach((error) =>
        {
            error.textContent = '';
            error.style.display = 'none';
        });
        this.shadowRoot.querySelectorAll('input').forEach((input) =>
        {
            input.classList.remove('error');
        });
    }

    saveUser(user)
    {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }

    getUsers()
    {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    loadUsers()
    {
        const userList = this.shadowRoot.getElementById('userList');
        const users = this.getUsers();

        userList.innerHTML = users.map(user => `
            <div class="user-item">
                <strong>${user.name}</strong>
                <p>Email: ${user.email}</p>
                <p>Age: ${user.age}</p>
                <button id="deleteButton" onclick="this.getRootNode().host.deleteUser('${user.id}')">Delete</button>
            </div>
        `).join('');
    }

    deleteUser(id)
    {
        const users = this.getUsers().filter(user => user.id !== id);
        localStorage.setItem('users', JSON.stringify(users));
        this.loadUsers();
    }
}

customElements.define('user-form', UserFormComponent);
