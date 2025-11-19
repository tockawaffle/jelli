import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export default getRequestConfig(async () => {
	const fromCookies = (await cookies()).get('locale')?.value;
	const fromHeader = (await headers()).get('accept-language')?.split(',')[0];
	const locale = fromCookies || fromHeader || 'pt-BR';

	return {
		locale,
		messages: (await import(`./locales/${locale}.json`)).default
	};
});