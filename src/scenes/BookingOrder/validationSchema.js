import * as yup from 'yup'
import { APP_CONSTANTS } from "../../utils/appContants"
import { isAfter, parse } from 'date-fns'
import { messages as msg } from '../../utils/validationMessages'

export default [
    yup.object().shape({
        trip: yup.object().required(msg.autocomplete.required),
        source: yup.object().required(msg.autocomplete.required),
        destination: yup.object().required(msg.autocomplete.required),
        from: yup.date().required(msg.autocomplete.required),
        to: yup.date().required(msg.autocomplete.required),
        bookingDateTime: yup.date().notRequired(),
        bookingType: yup.string().notRequired()
    }),
    yup.object().shape({
        seatNumber: yup.array().required(msg.autocomplete.required).min(1, "Chọn ít nhất 1 chỗ"),
    }),
    yup.object().shape({
        pickUpAddress: yup.string().required(msg.common.required),
        firstName: yup.string().required(msg.common.required),
        lastName: yup.string().required(msg.common.required),
        phone: yup
            .string()
            .matches(APP_CONSTANTS.PHONE_REGEX, msg.phone.invalid)
            .required(msg.common.required),
        email: yup
            .string()
            .matches(APP_CONSTANTS.EMAIL_REGEX, msg.email.invalid)
            .required(msg.common.required),
        totalPayment: yup.number().notRequired(),
        paymentDateTime: yup.date().notRequired(),
        paymentMethod: yup.string().required(msg.autocomplete.required),
        paymentStatus: yup.string().notRequired(),
        nameOnCard: yup.string().when('paymentMethod', {
            is: 'CARD',
            then: () =>
                yup.string().required(msg.common.required)
            ,
            otherwise: () => yup.string().notRequired()
        }),
        cardNumber: yup.string().when('paymentMethod', {
            is: "CARD",
            then: () =>
                yup.string().required(msg.common.required).matches(APP_CONSTANTS.VISA_REGEX, msg.card.cardNumber)
            ,
            otherwise: () => yup.string().notRequired()
        }),
        expiredDate: yup.string().when('paymentMethod', {
            is: "CARD",
            then: () =>
                yup.string().required(msg.common.required)
                    .test('expiredDate', msg.card.expiredDate, (value) => {
                        const expirationDate = parse(value, 'MM/yy', new Date());
                        return isAfter(expirationDate, new Date());
                    })
            ,
            otherwise: () => yup.string().notRequired()
        }),
        cvv: yup.string().when('paymentMethod', {
            is: "CARD",
            then: () =>
                yup.string().required(msg.common.required)
                    .test('len', msg.card.cvv, (value) => value && value.length === 3)
            ,
            otherwise: () => yup.string().notRequired()
        })
    })
]