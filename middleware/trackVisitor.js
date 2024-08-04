const { default: fetch } = import('node-fetch');
const Visitor = require('../models/visitors');

module.exports = async (req, res, next) => {
    try {
      const { default: fetch } = await import('node-fetch');
  
      let ip = req.ip;
      ip = ip.split(':').pop();
      
      const response = await fetch(`http://ip-api.com/json/${ip}`);
      
      const data = await response.json();
      
      if (data.status === 'success') {
        const { lat, lon, country, city } = data;
        
        // Check if visitor already exists
        const existingVisitor = await Visitor.findOne({ ip });
        
        if (!existingVisitor) {
          // Save new visitor
          const visitor = new Visitor({ ip, location: { lat, lng: lon, country, city } });
          await visitor.save();
        } else {
          // Update existing visitor
          existingVisitor.location = { lat, lng: lon, country, city };
          existingVisitor.visits++;
          await existingVisitor.save();
        }
      } else {
        console.log(`IP-API response error: ${data.message}`);
      }
      
    } catch (error) {
      console.error('Error processing visitor data:', error);
    }
  };