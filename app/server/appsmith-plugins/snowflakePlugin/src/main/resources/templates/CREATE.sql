INSERT INTO users
	(name, gender, email)
VALUES
	(
		'{{ nameInput.text }}',
		'{{ genderDropdown.selectedOptionValue }}',
		'{{ emailInput.text }}'
	);
