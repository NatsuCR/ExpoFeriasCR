const btn = document.getElementById('btnLogin');
        const errorDiv = document.getElementById('errorMsg');

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        const doLogin = async () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                errorDiv.innerText = 'Por favor complete ambos campos.';
                return;
            }

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'dashboard.html';
                } else {
                    errorDiv.innerText = data.error || 'Credenciales incorrectas';
                }
            } catch (err) {
                errorDiv.innerText = 'Error de conexión con el servidor.';
            }
        };

        btn.addEventListener('click', doLogin);

        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') doLogin();
        });

        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') doLogin();
        });
