class Time {

    constructor(message) {
        this.message = message;
    };

	convertMS(ms) {

		const message = this.message;

		const absoluteSeconds = Math.floor((ms / 1000) % 60);
		const absoluteMinutes = Math.floor((ms / (1000 * 60)) % 60);
		const absoluteHours = Math.floor((ms / (1000 * 60 * 60)) % 24);
		const absoluteDays = Math.floor(ms / (1000 * 60 * 60 * 24));
		
		const d = absoluteDays
			? absoluteDays === 1
				? message.drakeWS("time:ONE_DAY")
				: message.drakeWS("time:DAYS", { amount: absoluteDays })
			: null;
		const h = absoluteHours
			? absoluteHours === 1
				? message.drakeWS("time:ONE_HOUR")
				: message.drakeWS("time:HOURS", { amount: absoluteHours })
			: null;
		const m = absoluteMinutes
			? absoluteMinutes === 1
				? message.drakeWS("time:ONE_MINUTE")
				: message.drakeWS("time:MINUTES", { amount: absoluteMinutes })
			: null;
		const s = absoluteSeconds
			? absoluteSeconds === 1
				? message.drakeWS("time:ONE_SECOND")
				: message.drakeWS("time:SECONDS", { amount: absoluteSeconds })
			: null;
		const ams = ms
		? ms === 1
			? message.drakeWS("time:ONE_MILISECOND")
			: message.drakeWS("time:MILISECONDS", { amount: ms })
		: null;

		const absoluteTime = [];
		if (d) absoluteTime.push(d);
		if (h) absoluteTime.push(h);
		if (m) absoluteTime.push(m);
		if (s) absoluteTime.push(s);
		if (absoluteTime.length === 0) absoluteTime.push(ams);

		return absoluteTime.join(", ");
	};

	printDate(date, format, locale){
		if(!locale) locale = "fr-FR"
		if(!format) format = "Do MMMM YYYY";
		return moment(new Date(date)).locale("fr").format(format);
	};

	printDateFrom(date, format, locale){
		if(!locale) locale = "fr-FR"
		if(!format) format = "Do MMMM YYYY";
		moment.locale("fr");
		return moment.utc(date).startOf('hour').fromNow();
	};
};

module.exports = Time;