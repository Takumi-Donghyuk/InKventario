const form = document.getElementById('formUsuario');
form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    try {
        const response = await fetch('http://localhost:3000/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            alert('Usuario creado correctamente');
            form.reset();
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (err) {
        console.error(err);
        alert('Error de conexión al servidor');
    }
});
