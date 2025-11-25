<script>
	// apparently this will automatically fetch all the data via the load function in +page.server.ts? this is why SSR is good (I hope it works)
	let { data } = $props();
	let { audioFiles } = $state(data);
	let isAdmin = $state(data.isAdmin);

	// this is not how this is supposed to be done, but I don't think the Radio will be the victim of a cyberattack, so it should be fine
	let placeHolder = $state("enter admin password");
	let passwordInput = $state("");

	// for uploading a new file
	let inputtingNewFile = $state(false);

	// placeholder text for file input
	let fileName = $state("select new file to upload");

	// open input file dialog
	function setInputTrue() {
		inputtingNewFile = true;
	}

	// change placeholder after input change
	function changeFilePlaceholder(event) {
		const file = event.target.files[0];
		if (file) {
			fileName = file.name; // update label text with selected file name
		} else {
			fileName = "select new file to upload"; // reset if no file is selected
		}
	}

	// ask to confirm before deletion
	function confirmDelete(event) {
		if (!confirm("Are you sure you want to delete this entry?")) {
			event.preventDefault(); // Stop form submission
		}
	}
</script>

<!-- auth -->
{#if isAdmin}
	<!-- display files -->
	{#if audioFiles.length > 0}
		<table class="m-2">
			<thead>
				<tr class="border border-black">
					<th class="border border-black p-4 whitespace-nowrap" scope="col">date</th>
					<th class="border border-black p-4 whitespace-nowrap" scope="col">
						title (click to edit - enter to submit)
					</th>
					<!-- activate file input -->
					{#if !inputtingNewFile}
						<th
							class="cursor-pointer p-2 text-center font-bold whitespace-nowrap text-green-500 hover:bg-green-500 hover:text-white"
							scope="col"
							onclick={setInputTrue}>
							submit new file
						</th>
					{/if}
				</tr>
			</thead>

			<tbody>
				{#if inputtingNewFile}
					<tr>
						<td class="border border-black p-2 whitespace-nowrap"></td>
						<td class="border border-black p-2 whitespace-nowrap">
							<form id="submitForm" action="?/uploadFile" method="POST" enctype="multipart/form-data">
								<!-- hidden input to upload file -->
								<input
									id="files"
									type="file"
									name="fileToUpload"
									class="hidden"
									accept=".mp3"
									required
									onchange={changeFilePlaceholder} />
								<!-- label for hidden input to change placeholder -->
								<label class="cursor-pointer font-bold text-green-500" for="files">
									{#if fileName != "select new file to upload"}db/audio/{/if}{fileName}
								</label>
							</form>
						</td>
						<td
							class="cursor-pointer border border-black p-2 font-bold whitespace-nowrap text-green-500 hover:bg-green-500 hover:text-white">
							<button form="submitForm" class="ml-auto cursor-pointer" type="submit">submit</button>
						</td>
					</tr>
				{/if}
				{#each audioFiles as audioFile (audioFile.id)}
					<tr>
						<td class="border border-black p-2 whitespace-nowrap">{audioFile.sortDate}</td>
						{#if !inputtingNewFile}
							<td class="w-full border border-black p-2">
								<form action="?/editEntry" method="post">
									<!-- hidden field to pass the ID -->
									<input type="hidden" name="id" value={audioFile.id} />
									<!-- field for updated title -->
									<input class="w-full" type="text" name="title" value={audioFile.title} />
								</form>
							</td>
						{:else}
							<td class="w-full border border-black p-2">
								<form action="?/editEntry" method="post">
									<!-- hidden field to pass the ID -->
									<input type="hidden" name="id" value={audioFile.id} />
									<!-- field for updated title -->
									<input class="w-full" type="text" name="title" value={audioFile.filePath} />
								</form>
							</td>
						{/if}
						<td
							class="cursor-pointer border border-black p-2 text-center font-bold text-red-500 hover:bg-red-500 hover:text-white">
							<form action="?/deleteEntry" id="deleteForm-{audioFile.id}" method="post">
								<!-- hidden field to pass the ID -->
								<input type="hidden" name="id" value={audioFile.id} />
							</form>
							<button
								form="deleteForm-{audioFile.id}"
								class="ml-auto cursor-pointer font-bold"
								type="submit"
								onclick={confirmDelete}>
								delete
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
{:else}
	<!-- show login form if not authenticated -->
	<div class="flex h-screen items-center justify-center">
		<form class="flex -translate-y-15 placeholder-black" method="post" action="?/setAuthCookie">
			<input
				class="mr-2 w-80 border border-black p-4"
				name="passwordInput"
				type="password"
				value={passwordInput}
				placeholder={placeHolder} />
			<button class="border border-black p-4" type="submit">login</button>
		</form>
	</div>
{/if}
