export const getWidth = (screenWidth: number) => {
	let width;
	if (screenWidth < 1025) {
		width = 350;
	} else if (screenWidth < 1100) {
		// width = 375;
		width = 400;
	} else if (screenWidth < 1200) {
		width = 450;
	} else if (screenWidth < 1300) {
		width = 425;
	} else if (screenWidth < 1400) {
		width = 450;
	} else if (screenWidth < 1500) {
		width = 500;
	} else if (screenWidth < 1650) {
		width = 550;
	} else if (screenWidth < 1750) {
		width = 600;
	} else if (screenWidth < 1900) {
		width = 650;
	} else if (screenWidth < 2000) {
		width = 700;
	} else if (screenWidth < 2200) {
		width = 750;
	} else {
		width = 800;
	}

	return width;
};
