async function signup(event) {
    try {
        event.preventDefault()
        const username = event.target.username.value
        const email = event.target.email.value
        const password = event.target.password.value

        let obj_info = {
            username:  username,
            email: email,
            password: password
        }
        const data = await axios.post(`http://localhost:3000/users/signup`, obj_info)
        console.log("data", data)
        if(data.status===201){
            alert("Signup successful, please login")
            window.location.href= "./login.html"
        }
        else{
            throw new Error("Failed to login")
        }

    } catch (error) {
        const div = document.getElementById("message")
        div.textContent = error.response.data.message
        div.style.color="red"
        console.log("signup html :", error)
    }
    
}
