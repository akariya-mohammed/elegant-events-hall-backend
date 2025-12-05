const express = require('express');
const cors = require('cors');
const app = express();

// ============================================
// MIDDLEWARE - CRITICAL FOR FRONTEND CONNECTION
// ============================================

// Enable CORS for ALL origins (allows frontend to connect)
app.use(cors({
    origin: '*', // Allow all origins (you can restrict this later)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================
// IN-MEMORY DATABASE (Replace with real DB later)
// ============================================
let bookings = [];
let bookingIdCounter = 1;

// ============================================
// ROUTES
// ============================================

// Root route - Health check
app.get('/', (req, res) => {
    res.send('Events Hall Backend Running - API Ready!');
});

// GET all bookings
app.get('/api/bookings', (req, res) => {
    try {
        console.log('Fetching all bookings:', bookings.length);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ 
            message: 'Error fetching bookings',
            error: error.message 
        });
    }
});

// GET single booking by ID
app.get('/api/bookings/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const booking = bookings.find(b => b.id === id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ 
            message: 'Error fetching booking',
            error: error.message 
        });
    }
});

// POST create new booking
app.post('/api/bookings', (req, res) => {
    try {
        const { hallType, date, customerName, customerEmail, customerPhone } = req.body;
        
        // Validation
        if (!hallType || !date || !customerName || !customerEmail || !customerPhone) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['hallType', 'date', 'customerName', 'customerEmail', 'customerPhone']
            });
        }
        
        // Check if date is already booked for this hall
        const existingBooking = bookings.find(
            b => b.hallType === hallType && b.date === date
        );
        
        if (existingBooking) {
            return res.status(409).json({ 
                message: 'This date is already booked for the selected hall',
                existingBooking 
            });
        }
        
        // Create new booking
        const newBooking = {
            id: bookingIdCounter++,
            hallType,
            date,
            customerName,
            customerEmail,
            customerPhone,
            createdAt: new Date().toISOString(),
            status: 'confirmed'
        };
        
        bookings.push(newBooking);
        
        console.log('New booking created:', newBooking);
        
        res.status(201).json({
            message: 'Booking created successfully',
            booking: newBooking
        });
        
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ 
            message: 'Error creating booking',
            error: error.message 
        });
    }
});

// DELETE booking by ID
app.delete('/api/bookings/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = bookings.findIndex(b => b.id === id);
        
        if (index === -1) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        const deletedBooking = bookings.splice(index, 1)[0];
        
        console.log('Booking deleted:', deletedBooking);
        
        res.json({
            message: 'Booking deleted successfully',
            booking: deletedBooking
        });
        
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ 
            message: 'Error deleting booking',
            error: error.message 
        });
    }
});

// GET bookings by hall type
app.get('/api/bookings/hall/:hallType', (req, res) => {
    try {
        const hallType = req.params.hallType.toLowerCase();
        const hallBookings = bookings.filter(b => b.hallType.toLowerCase() === hallType);
        
        res.json(hallBookings);
    } catch (error) {
        console.error('Error fetching hall bookings:', error);
        res.status(500).json({ 
            message: 'Error fetching hall bookings',
            error: error.message 
        });
    }
});

// GET bookings by date
app.get('/api/bookings/date/:date', (req, res) => {
    try {
        const date = req.params.date;
        const dateBookings = bookings.filter(b => b.date === date);
        
        res.json(dateBookings);
    } catch (error) {
        console.error('Error fetching date bookings:', error);
        res.status(500).json({ 
            message: 'Error fetching date bookings',
            error: error.message 
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        availableRoutes: [
            'GET /',
            'GET /api/bookings',
            'GET /api/bookings/:id',
            'POST /api/bookings',
            'DELETE /api/bookings/:id',
            'GET /api/bookings/hall/:hallType',
            'GET /api/bookings/date/:date'
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: err.message 
    });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ CORS enabled - Frontend can connect`);
    console.log(`✅ API ready at http://localhost:${PORT}/api/bookings`);
});
