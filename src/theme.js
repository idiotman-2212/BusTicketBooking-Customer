import { createTheme } from '@mui/material/styles'

export const tokens = (mode = 'light') => ({
    ...(mode === 'light' ?
        {
            primary: {
                100: "#ffffff",
                200: "#ffffff",
                300: "#ffffff",
                400: "#ffffff",
                500: "#ffffff",
                600: "#cccccc",
                700: "#999999",
                800: "#666666",
                900: "#333333"
            },
            greyAccent: {
                100: "#f4f4f4",
                200: "#e8e8e8",
                300: "#dddddd",
                400: "#d1d1d1",
                500: "#c6c6c6",
                600: "#9e9e9e",
                700: "#777777",
                800: "#4f4f4f",
                900: "#282828"
            },

            greenAccent: {
                100: "#d0efd5",
                200: "#a2dfab",
                300: "#73d081",
                400: "#45c057",
                500: "#16b02d",
                600: "#128d24",
                700: "#0d6a1b",
                800: "#094612",
                900: "#042309"
            },

            blueAccent: {
                100: "#d8edf2",
                200: "#b2dbe4",
                300: "#8bc9d7",
                400: "#65b7c9",
                500: "#3ea5bc",
                600: "#328496",
                700: "#256371",
                800: "#19424b",
                900: "#0c2126"
            },
        } : {
            primary: {
                100: "#333333",
                200: "#666666",
                300: "#999999",
                400: "#cccccc",
                500: "#ffffff",
                600: "#ffffff",
                700: "#ffffff",
                800: "#ffffff",
                900: "#ffffff",
            },
            greyAccent: {
                100: "#282828",
                200: "#4f4f4f",
                300: "#777777",
                400: "#9e9e9e",
                500: "#c6c6c6",
                600: "#d1d1d1",
                700: "#dddddd",
                800: "#e8e8e8",
                900: "#f4f4f4",
            },

            greenAccent: {
                100: "#042309",
                200: "#094612",
                300: "#0d6a1b",
                400: "#128d24",
                500: "#16b02d",
                600: "#45c057",
                700: "#73d081",
                800: "#a2dfab",
                900: "#d0efd5",
            },

            blueAccent: {
                100: "#0c2126",
                200: "#19424b",
                300: "#256371",
                400: "#328496",
                500: "#3ea5bc",
                600: "#65b7c9",
                700: "#8bc9d7",
                800: "#b2dbe4",
                900: "#d8edf2",
            },
        }
    )
})

export const themeSettings = (mode = 'light') => {
    const colors = tokens(mode)
    return {
        // palette: {
        //     mode: mode,
        //     ...(mode === "dark"
        //         ? {
        //             // palette values for dark mode
        //             primary: {
        //                 main: colors.primary[500],
        //             },
        //             secondary: {
        //                 main: colors.greenAccent[500],
        //             },
        //             neutral: {
        //                 dark: colors.grey[700],
        //                 main: colors.grey[500],
        //                 light: colors.grey[100],
        //             },
        //             background: {
        //                 default: colors.primary[500],
        //             },
        //         }
        //         : {
        //             // palette values for light mode
        //             primary: {
        //                 main: colors.primary[100],
        //             },
        //             secondary: {
        //                 main: colors.greenAccent[500],
        //             },
        //             neutral: {
        //                 dark: colors.grey[700],
        //                 main: colors.grey[500],
        //                 light: colors.grey[100],
        //             },
        //             background: {
        //                 default: "#fcfcfc",
        //             },
        //         }
        //     )
        // },
        typography: {
            fontFamily: ["Roboto", "sans-serif"].join(","),
            fontSize: 12,
            h1: {
                fontFamily: ["Roboto", "sans-serif"].join(","),
                fontSize: 40,
            },
            h2: {
                fontFamily: ["Roboto", "sans-serif"].join(","),
                fontSize: 32,
            },
            h3: {
                fontFamily: ["Roboto", "sans-serif"].join(","),
                fontSize: 24,
            },
            h4: {
                fontFamily: ["Roboto", "sans-serif"].join(","),
                fontSize: 20,
            },
            h5: {
                fontFamily: ["Roboto", "sans-serif"].join(","),
                fontSize: 16,
            },
            h6: {
                fontFamily: ["Roboto", "sans-serif"].join(","),
                fontSize: 14,
            },
        }
    }
}



