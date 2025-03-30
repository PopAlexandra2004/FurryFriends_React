module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        ['@babel/plugin-transform-runtime'],
        ['@babel/plugin-transform-class-properties', { loose: true }],  // Add this plugin with loose:true
        ['@babel/plugin-transform-private-methods', { loose: true }],    // Ensure the same loose:true here
    ],
};

