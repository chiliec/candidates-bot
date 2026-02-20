import { I18n } from "@grammyjs/i18n"
import en from "./en"
import ru from "./ru"

export const i18n = new I18n({
    defaultLocale: "en",
    useSession: true
})

i18n.loadLocaleSync("en", { source: en })
i18n.loadLocaleSync("ru", { source: ru })
