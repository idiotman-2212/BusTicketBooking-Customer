import { createContext, useState, useMemo } from 'react'
import { createTheme } from '@mui/material/styles'

export const tokens = (mode = 'light') => ({
    ...(mode === 'light'
        ? {
            grey: {
                100: "#e0e0e0",
                200: "#c2c2c2",
                300: "#a3a3a3",
                400: "#858585",
                500: "#666666",
                600: "#525252",
                700: "#3d3d3d",
                800: "#292929",
                900: "#141414",
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
            primary: {
                100: "#d0d1d5",
                200: "#a1a4ab",
                300: "#727681",
                400: "#1F2A40",
                500: "#141b2d",
                600: "#101624",
                700: "#0c101b",
                800: "#080b12",
                900: "#040509",
            },
            greenAccent: {
                100: "#dbf5ee",
                200: "#b7ebde",
                300: "#94e2cd",
                400: "#70d8bd",
                500: "#4cceac",
                600: "#3da58a",
                700: "#2e7c67",
                800: "#1e5245",
                900: "#0f2922",
            },
            redAccent: {
                100: "#f8dcdb",
                200: "#f1b9b7",
                300: "#e99592",
                400: "#e2726e",
                500: "#db4f4a",
                600: "#af3f3b",
                700: "#832f2c",
                800: "#58201e",
                900: "#2c100f",
            },
            blueAccent: {
                100: "#e1e2fe",
                200: "#c3c6fd",
                300: "#a4a9fc",
                400: "#868dfb",
                500: "#6870fa",
                600: "#535ac8",
                700: "#3e4396",
                800: "#2a2d64",
                900: "#151632",
            },
        }
        : {
            primary: {
                100: "#1a1a1a", // Nền chính tối nhưng không quá tối
                200: "#292929", // Màu xám tối
                300: "#404040", // Màu cho các vùng chính
                400: "#666666", // Màu nút hoặc các phần tương tác
                500: "#90caf9", // Màu xanh cho chế độ tối
                600: "#5e92f3", // Biến thể xanh lam
                700: "#303f9f", // Biến thể đậm hơn
                800: "#283593",
                900: "#1a237e",
            },
            grey: {
                100: "#121212", // Màu nền gần đen
                200: "#1d1d1d", // Màu nền cho các khối khác
                300: "#232323",
                400: "#2c2c2c",
                500: "#3e3e3e", // Màu cho các thành phần chính
                600: "#606060",
                700: "#9e9e9e",
                800: "#e0e0e0",
                900: "#ffffff", // Màu chữ sáng
            },
            greenAccent: {
                100: "#042309",
                200: "#094612",
                300: "#0d6a1b",
                400: "#128d24",
                500: "#16b02d", // Màu xanh lá cây
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
                500: "#3ea5bc", // Màu xanh dương nhạt
                600: "#65b7c9",
                700: "#8bc9d7",
                800: "#b2dbe4",
                900: "#d8edf2",
            }, redAccent: {
                100: "#f8dcdb",
                200: "#f1b9b7",
                300: "#e99592",
                400: "#e2726e",
                500: "#db4f4a",
                600: "#af3f3b",
                700: "#832f2c",
                800: "#58201e",
                900: "#2c100f",
            },
        }
    )
})

export const themeSettings = (mode) => {
    const colors = tokens(mode)

    return {
        palette: {
            mode: mode,
            ...(mode === "dark"
                ? {
                    // palette values for dark mode
                    primary: {
                        main: colors.primary[500], // Sử dụng màu xanh nhạt làm màu chính cho dark mode
                    },
                    secondary: {
                        main: colors.greenAccent[500], // Màu nhấn xanh lá
                    },
                    neutral: {
                        dark: colors.grey[700],
                        main: colors.grey[500],
                        light: colors.grey[100],
                    },
                    background: {
                        default: colors.blueAccent[100], // Sáng hơn một chút để dễ nhìn
                        paper: colors.primary[200], // Nền các card hoặc modal
                    },
                    text: {
                        primary: "#ffffff", // Màu chữ trắng
                        secondary: "#b0bec5", // Màu chữ phụ
                    },
                }
                : {
                    // palette values for light mode
                    primary: {
                        main: colors.primary[100],
                    },
                    secondary: {
                        main: colors.greenAccent[500],
                    },
                    neutral: {
                        dark: colors.grey[700],
                        main: colors.grey[500],
                        light: colors.grey[100],
                    },
                    background: {
                        default: "#fcfcfc",
                    },
                }
            )
        },
        typography: {
            fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
            fontSize: 12,
            h1: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 40,
            },
            h2: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 32,
            },
            h3: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 24,
            },
            h4: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 20,
            },
            h5: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 16,
            },
            h6: {
                fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
                fontSize: 14,
            },
        }
    }
}

// context for color mode
export const ColorModeContext = createContext({
    toggleColorMode: () => { }
})

export const useMode = () => {
    const [mode, setMode] = useState('light');

    const colorMode = useMemo(() => ({
        toggleColorMode: () =>
            setMode((prev) => (prev === "light" ? "dark" : "light")),
    }), []);

    const theme = useMemo(() => createTheme(themeSettings(mode)), [mode])

    return [theme, colorMode];
}
