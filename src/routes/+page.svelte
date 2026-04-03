<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<div class="login-page">
	<div class="card login-card">
		<h1>FlashCards</h1>
		<p class="subtitle">Testez vos connaissances avec des cartes flash</p>

		{#if form?.error}
			<div class="error-message">{form.error}</div>
		{/if}

		<form method="POST" action="?/login" use:enhance>
			<label for="username">Entrez votre pseudo</label>
			<div class="input-row">
				<input type="text" id="username" name="username" placeholder="Pseudo..." required minlength="2" />
				<button type="submit" class="btn-primary">Entrer</button>
			</div>
		</form>

		{#if data.users.length > 0}
			<div class="separator">
				<span>ou sélectionnez un utilisateur existant</span>
			</div>

			<div class="user-list">
				{#each data.users as user}
					<form method="POST" action="?/select" use:enhance>
						<input type="hidden" name="userId" value={user.id} />
						<button type="submit" class="btn-secondary user-btn">{user.username}</button>
					</form>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.login-page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 80vh;
	}

	.login-card {
		width: 100%;
		max-width: 440px;
		text-align: center;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 0.3rem;
	}

	.subtitle {
		color: var(--accent-secondary);
		margin-bottom: 1.5rem;
		font-size: 0.95rem;
	}

	label {
		display: block;
		text-align: left;
		font-weight: 500;
		margin-bottom: 0.4rem;
		color: var(--text-title);
		font-size: 0.9rem;
	}

	.input-row {
		display: flex;
		gap: 0.5rem;
	}

	.input-row input {
		flex: 1;
	}

	.separator {
		margin: 1.5rem 0;
		display: flex;
		align-items: center;
		gap: 0.8rem;
		color: var(--accent-secondary);
		font-size: 0.85rem;
	}

	.separator::before,
	.separator::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--accent-secondary);
	}

	.user-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
	}

	.user-btn {
		padding: 0.4rem 1rem;
	}

	.error-message {
		margin-bottom: 1rem;
	}
</style>
