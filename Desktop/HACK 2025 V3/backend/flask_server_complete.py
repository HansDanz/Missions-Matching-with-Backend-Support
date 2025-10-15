# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, auth as admin_auth
from datetime import datetime
from functools import wraps
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# --- Initialize Firebase Admin SDK ---
try:
    cred = credentials.Certificate('/Users/Jon_Ooi/Desktop/HACK 2025 (UPDATED)/backend/config/waymakers-service-account.json')
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully!")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    exit(1)

db = firestore.client()

# ===== AUTHENTICATION MIDDLEWARE =====

def verify_token(f):
    """Decorator to verify Firebase Auth token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "No authorization token provided"}), 401
        
        id_token = auth_header.split('Bearer ')[1]
        
        try:
            # Verify the token using Firebase Admin SDK
            decoded_token = admin_auth.verify_id_token(id_token)
            request.user_id = decoded_token['uid']  # Add user_id to request
            request.user_email = decoded_token.get('email')
            return f(*args, **kwargs)
        except Exception as e:
            print(f"Token verification error: {e}")
            return jsonify({"error": "Invalid or expired token"}), 401
    
    return decorated_function

# ===== MISSION ROUTES =====

@app.route('/missions', methods=['POST'])
@verify_token
def add_mission():
    """Create a new mission opportunity (requires authentication)"""
    try:
        mission_data = request.json
        
        # Validate required fields
        required_fields = ['title', 'organization', 'location']
        if not mission_data or not all(k in mission_data for k in required_fields):
            return jsonify({"error": "Missing required fields: title, organization, location"}), 400

        # Add user ID from authenticated token
        mission_data['organizerId'] = request.user_id
        
        # Add timestamps
        mission_data['createdAt'] = firestore.SERVER_TIMESTAMP
        mission_data['updatedAt'] = firestore.SERVER_TIMESTAMP
        
        # Add default status if not provided
        if 'status' not in mission_data:
            mission_data['status'] = 'open'
        
        # Add the document to the 'missions' collection
        timestamp, doc_ref = db.collection('missions').add(mission_data)
        
        return jsonify({
            "message": "Mission opportunity added successfully!",
            "id": doc_ref.id
        }), 201

    except Exception as e:
        print(f"Error adding mission: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/missions', methods=['GET'])
def get_missions():
    """Get all mission opportunities (public - no auth required)"""
    print("📥 Received request for missions")
    missions = [
        {
            "id": "1",
            "title": "Test Mission",
            "missionType": "Short-term",
            "country": "USA",
            "details": "Test mission details"
        }
    ]
    try:
        missions_ref = db.collection('missions')
        
        # Optional filters
        status = request.args.get('status')  # ?status=open
        organizer_id = request.args.get('organizerId')  # ?organizerId=123
        
        # Apply filters if provided
        if status:
            missions_ref = missions_ref.where('status', '==', status)
        if organizer_id:
            missions_ref = missions_ref.where('organizerId', '==', organizer_id)
        
        # Order by creation date (newest first)
        missions_ref = missions_ref.order_by('createdAt', direction=firestore.Query.DESCENDING)
        
        docs = missions_ref.stream()

        missions_list = []
        for doc in docs:
            mission_data = doc.to_dict()
            mission_data['id'] = doc.id
            
            # Convert Firestore timestamps to ISO format strings
            if 'createdAt' in mission_data and mission_data['createdAt']:
                mission_data['createdAt'] = mission_data['createdAt'].isoformat()
            if 'updatedAt' in mission_data and mission_data['updatedAt']:
                mission_data['updatedAt'] = mission_data['updatedAt'].isoformat()
            
            missions_list.append(mission_data)
        print("📤 Sending response:", missions)
        return jsonify(missions_list), 200

    except Exception as e:
        print(f"Error getting missions: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/missions/<mission_id>', methods=['GET'])
def get_mission(mission_id):
    """Get a specific mission by ID (public - no auth required)"""
    try:
        doc_ref = db.collection('missions').document(mission_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Mission not found"}), 404
        
        mission_data = doc.to_dict()
        mission_data['id'] = doc.id
        
        # Convert timestamps
        if 'createdAt' in mission_data and mission_data['createdAt']:
            mission_data['createdAt'] = mission_data['createdAt'].isoformat()
        if 'updatedAt' in mission_data and mission_data['updatedAt']:
            mission_data['updatedAt'] = mission_data['updatedAt'].isoformat()
        
        return jsonify(mission_data), 200

    except Exception as e:
        print(f"Error getting mission: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/missions/<mission_id>', methods=['PATCH'])
@verify_token
def update_mission(mission_id):
    """Update a mission (requires authentication and ownership)"""
    try:
        update_data = request.json
        
        if not update_data:
            return jsonify({"error": "No update data provided"}), 400
        
        doc_ref = db.collection('missions').document(mission_id)
        doc = doc_ref.get()
        
        # Check if document exists
        if not doc.exists:
            return jsonify({"error": "Mission not found"}), 404
        
        mission_data = doc.to_dict()
        
        # Verify user owns this mission (unless they're just applying)
        if mission_data.get('organizerId') != request.user_id:
            return jsonify({"error": "Unauthorized: You can only update your own missions"}), 403
        
        # Add updated timestamp
        update_data['updatedAt'] = firestore.SERVER_TIMESTAMP
        
        # Update the document
        doc_ref.update(update_data)
        
        return jsonify({
            "message": "Mission updated successfully!",
            "id": mission_id
        }), 200

    except Exception as e:
        print(f"Error updating mission: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/missions/<mission_id>', methods=['DELETE'])
@verify_token
def delete_mission(mission_id):
    """Delete a mission (requires authentication and ownership)"""
    try:
        doc_ref = db.collection('missions').document(mission_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Mission not found"}), 404
        
        mission_data = doc.to_dict()
        
        # Verify user owns this mission
        if mission_data.get('organizerId') != request.user_id:
            return jsonify({"error": "Unauthorized: You can only delete your own missions"}), 403
        
        doc_ref.delete()
        
        return jsonify({
            "message": "Mission deleted successfully!",
            "id": mission_id
        }), 200

    except Exception as e:
        print(f"Error deleting mission: {e}")
        return jsonify({"error": str(e)}), 500


# ===== APPLICATION ROUTES =====

@app.route('/missions/<mission_id>/applications', methods=['POST'])
@verify_token
def add_application(mission_id):
    """Add an application to a mission (requires authentication)"""
    try:
        application_data = request.json
        
        # Validate required fields
        required_fields = ['applicantId', 'name', 'email', 'phoneNumber', 'details']
        if not application_data or not all(k in application_data for k in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Verify the applicant is the authenticated user
        if application_data['applicantId'] != request.user_id:
            return jsonify({"error": "Unauthorized: You can only apply as yourself"}), 403
        
        # Check if mission exists
        mission_ref = db.collection('missions').document(mission_id)
        mission = mission_ref.get()
        
        if not mission.exists:
            return jsonify({"error": "Mission not found"}), 404
        
        # Ensure timestamp is ISO string
        application_data['jobId'] = mission_id
        if 'timestamp' not in application_data or not application_data['timestamp']:
            application_data['timestamp'] = datetime.now().isoformat()
        
        # Add application to subcollection
        _, app_ref = db.collection('missions').document(mission_id).collection('applications').add(application_data)
        
        # Update the mission document with application summary
        mission_data = mission.to_dict()
        current_applications = mission_data.get('applications', [])
        
        # Add application summary (all plain values, no Sentinels)
        application_summary = {
            'id': app_ref.id,
            'applicantId': application_data['applicantId'],
            'name': application_data['name'],
            'email': application_data['email'],
            'timestamp': application_data['timestamp'],  # Already ISO string
            'phoneNumber': application_data['phoneNumber'],
            'details': application_data['details']
        }
        current_applications.append(application_summary)
        
        # Use separate update calls to avoid mixing Sentinels with data
        mission_ref.update({'applications': current_applications})
        mission_ref.update({'updatedAt': firestore.SERVER_TIMESTAMP})
        
        return jsonify({
            "message": "Application submitted successfully!",
            "id": app_ref.id,
            "missionId": mission_id
        }), 201

    except Exception as e:
        print(f"Error adding application: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/missions/<mission_id>/applications', methods=['GET'])
@verify_token
def get_applications(mission_id):
    """Get all applications for a mission (requires authentication and ownership)"""
    try:
        # Check if mission exists
        mission_ref = db.collection('missions').document(mission_id)
        mission = mission_ref.get()
        
        if not mission.exists:
            return jsonify({"error": "Mission not found"}), 404
        
        mission_data = mission.to_dict()
        
        # Verify user owns this mission
        if mission_data.get('organizerId') != request.user_id:
            return jsonify({"error": "Unauthorized: You can only view applications for your own missions"}), 403
        
        # Get applications from subcollection
        apps_ref = mission_ref.collection('applications').order_by('timestamp', direction=firestore.Query.DESCENDING)
        docs = apps_ref.stream()
        
        applications_list = []
        for doc in docs:
            app_data = doc.to_dict()
            app_data['id'] = doc.id
            
            # Convert timestamps
            if 'timestamp' in app_data and app_data['timestamp']:
                app_data['timestamp'] = app_data['timestamp'].isoformat()
            if 'createdAt' in app_data and app_data['createdAt']:
                app_data['createdAt'] = app_data['createdAt'].isoformat()
            
            applications_list.append(app_data)
        
        return jsonify(applications_list), 200

    except Exception as e:
        print(f"Error getting applications: {e}")
        return jsonify({"error": str(e)}), 500

# Add to your existing Flask routes
@app.route('/skills', methods=['GET'])
def get_skills():
    skills_ref = db.collection('skills')
    skills = [doc.to_dict() | {'id': doc.id} for doc in skills_ref.stream()]
    return jsonify(skills)

# ...existing imports...

@app.route('/skills', methods=['POST'])
@verify_token
def add_skill():
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'error': 'Missing skill name'}), 400
    
    skill_ref = db.collection('skills').document()
    skill_ref.set({
        'name': data['name'],
        'createdAt': int(time.time() * 1000),
        'addedFrom': 'job-posting'
    })
    
    return jsonify({
        'id': skill_ref.id,
        'name': data['name']
    }), 201

# ===== USER ROUTES =====
# Note: User creation and authentication is handled by Firebase Auth on the client side
# User profile data is stored in Firestore 'users' collection with UID as document ID
# The client can read/write directly to Firestore using Firebase SDK

@app.route('/users/<user_id>', methods=['GET'])
@verify_token
def get_user(user_id):
    """Get user profile (requires authentication)"""
    try:
        # Users can only access their own profile or public profiles
        if user_id != request.user_id:
            # For now, allow viewing other profiles (you can restrict this)
            pass
        
        doc_ref = db.collection('users').document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "User not found"}), 404
        
        user_data = doc.to_dict()
        user_data['id'] = doc.id
        
        # Convert timestamps
        if 'createdAt' in user_data and user_data['createdAt']:
            user_data['createdAt'] = user_data['createdAt']
        
        return jsonify(user_data), 200

    except Exception as e:
        print(f"Error getting user: {e}")
        return jsonify({"error": str(e)}), 500



# ===== HEALTH CHECK =====

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "Waymakers API is running with Firebase Authentication!",
        "timestamp": datetime.now().isoformat()
    }), 200


# ===== ERROR HANDLERS =====

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)  # debug=True for development only