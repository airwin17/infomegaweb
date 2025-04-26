
const selectElement = document.querySelector('.lang-select');
if(document.querySelector("a").innerText=="Accueil >"){
    selectElement.selectedIndex="0"
}else
    selectElement.selectedIndex="1"
selectElement.addEventListener('change', () => {
    const selectedOption = selectElement.selectedOptions[0];
    if (selectedOption != null) {
        if (selectedOption.value == "en")
            location.href = "/en/"
        else
            location.href = "/fr/"
    }
});
