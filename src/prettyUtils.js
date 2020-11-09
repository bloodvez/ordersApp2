const prettyTime = (inputDate) =>
{
    let currentDate = inputDate === undefined ? new Date() : new Date(inputDate * 1000)
    //making hours and minutes look nice
    let currentHour = currentDate.getHours() < 10 ? "0" + currentDate.getHours() : currentDate.getHours()
    let currentMinute = currentDate.getMinutes() < 10 ? "0" + currentDate.getMinutes() : currentDate.getMinutes()
    return { hour: currentHour, minute: currentMinute }
}

exports.prettyTime = prettyTime